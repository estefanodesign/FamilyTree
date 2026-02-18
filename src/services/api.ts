import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Person, ActivityLog } from '@/types/family';

// ============================================
// Database row types (snake_case from Postgres)
// ============================================
interface PersonRow {
    id: string;
    first_name: string;
    last_name: string;
    birth_date: string | null;
    death_date: string | null;
    gender: 'male' | 'female' | 'other';
    photo: string | null;
    bio: string | null;
    occupation: string | null;
    location: string | null;
    spouse_id: string | null;
}

interface ParentChildRow {
    parent_id: string;
    child_id: string;
}

// ============================================
// Converters: DB Row <-> App Person
// ============================================
function rowToPerson(
    row: PersonRow,
    parentIds: string[],
    childrenIds: string[]
): Person {
    return {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name || '',
        birthDate: row.birth_date || '',
        deathDate: row.death_date || undefined,
        gender: row.gender,
        photo: row.photo || undefined,
        bio: row.bio || undefined,
        occupation: row.occupation || undefined,
        location: row.location || undefined,
        spouseId: row.spouse_id || undefined,
        parentIds,
        childrenIds,
    };
}

function personToRow(person: Person): Omit<PersonRow, 'id'> & { id?: string } {
    return {
        id: person.id,
        first_name: person.firstName,
        last_name: person.lastName,
        birth_date: person.birthDate || null,
        death_date: person.deathDate || null,
        gender: person.gender,
        photo: person.photo || null,
        bio: person.bio || null,
        occupation: person.occupation || null,
        location: person.location || null,
        spouse_id: person.spouseId || null,
    };
}

// ============================================
// API Functions
// ============================================

/**
 * Fetch all people with their relationships.
 */
export async function fetchPeople(): Promise<Person[]> {
    if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase not configured');
    }

    // Fetch all people
    const { data: peopleRows, error: peopleError } = await supabase
        .from('people')
        .select('*')
        .order('created_at', { ascending: true });

    if (peopleError) throw peopleError;
    if (!peopleRows) return [];

    // Fetch all parent-child relationships
    const { data: relations, error: relError } = await supabase
        .from('parent_child')
        .select('parent_id, child_id');

    if (relError) throw relError;

    // Build lookup maps
    const parentMap = new Map<string, string[]>(); // child -> parents
    const childMap = new Map<string, string[]>();  // parent -> children

    (relations || []).forEach((rel: ParentChildRow) => {
        // Parent map (child -> parents)
        if (!parentMap.has(rel.child_id)) parentMap.set(rel.child_id, []);
        parentMap.get(rel.child_id)!.push(rel.parent_id);

        // Child map (parent -> children)
        if (!childMap.has(rel.parent_id)) childMap.set(rel.parent_id, []);
        childMap.get(rel.parent_id)!.push(rel.child_id);
    });

    // Convert rows to Person objects
    return peopleRows.map((row: PersonRow) =>
        rowToPerson(
            row,
            parentMap.get(row.id) || [],
            childMap.get(row.id) || []
        )
    );
}

/**
 * Create a new person and their relationships.
 */
export async function createPerson(person: Person): Promise<Person> {
    if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase not configured');
    }

    const row = personToRow(person);

    const { data, error } = await supabase
        .from('people')
        .insert(row)
        .select()
        .single();

    if (error) throw error;

    // Insert parent-child relationships
    if (person.parentIds.length > 0) {
        const parentRelations = person.parentIds.map(parentId => ({
            parent_id: parentId,
            child_id: data.id,
        }));

        const { error: relError } = await supabase
            .from('parent_child')
            .insert(parentRelations);

        if (relError) throw relError;
    }

    const result = { ...person, id: data.id };

    // Log creation
    if (isSupabaseConfigured) {
        await createLog({
            personId: result.id,
            personName: `${result.firstName} ${result.lastName}`.trim(),
            action: 'CREATE',
            details: 'Menambahkan anggota keluarga baru'
        });
    }

    return result;
}

/**
 * Update an existing person.
 */
export async function updatePerson(person: Person): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase not configured');
    }

    // Fetch old data for diffing
    const { data: oldRow } = await supabase
        .from('people')
        .select('*')
        .eq('id', person.id)
        .single();

    let diff = 'Memperbarui data';
    if (oldRow) {
        const oldPerson = rowToPerson(oldRow, [], []); // relations don't matter for diff
        diff = generateDiff(oldPerson, person);
    }

    // Proceed with update

    const row = personToRow(person);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...updateData } = row;

    const { error } = await supabase
        .from('people')
        .update(updateData)
        .eq('id', person.id);

    if (error) throw error;

    // Log update
    if (diff) {
        await createLog({
            personId: person.id,
            personName: `${person.firstName} ${person.lastName}`.trim(),
            action: 'UPDATE',
            details: diff
        });
    }

    // Rebuild parent relationships
    // 1. Delete existing
    const { error: delError } = await supabase
        .from('parent_child')
        .delete()
        .eq('child_id', person.id);

    if (delError) throw delError;

    // 2. Re-insert
    if (person.parentIds.length > 0) {
        const parentRelations = person.parentIds.map(parentId => ({
            parent_id: parentId,
            child_id: person.id,
        }));

        const { error: relError } = await supabase
            .from('parent_child')
            .insert(parentRelations);

        if (relError) throw relError;
    }
}

/**
 * Delete a person and all their relationships.
 */
export async function deletePerson(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase not configured');
    }

    // Fetch name for log
    const { data: person } = await supabase
        .from('people')
        .select('first_name, last_name')
        .eq('id', id)
        .single();

    const personName = person ? `${person.first_name} ${person.last_name || ''}`.trim() : 'Unknown';

    // Remove spouse references from other people
    const { error: spouseError } = await supabase
        .from('people')
        .update({ spouse_id: null })
        .eq('spouse_id', id);

    if (spouseError) throw spouseError;

    // Log deletion (before validation checks or after? Database consistency matters more)
    // We log after successful delete usually, but here we need to ensure we don't fail.
    // Let's do it at the end.

    // Delete relationships (CASCADE handles this, but explicit is clearer)
    await supabase.from('parent_child').delete().eq('parent_id', id);
    await supabase.from('parent_child').delete().eq('child_id', id);

    // Delete the person
    const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', id);

    if (error) throw error;

    await createLog({
        personId: undefined, // Person is gone
        personName: personName,
        action: 'DELETE',
        details: `Menghapus anggota keluarga: ${personName}`
    });
}

/**
 * Upload a photo to storage or convert to Base64.
 */
export async function uploadPhoto(file: File): Promise<string> {
    // Helper for Base64 conversion
    const toBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    if (isSupabaseConfigured && supabase) {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase
                .storage
                .from('photos')
                .upload(filePath, file);

            if (uploadError) {
                // If bucket not found or other error, throw to catch block
                throw uploadError;
            }

            const { data } = supabase
                .storage
                .from('photos')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.warn('Supabase upload failed (likely missing "photos" bucket), falling back to Base64:', error);
            return toBase64(file);
        }
    } else {
        return toBase64(file);
    }
}

/**
 * Seed the database with initial data (for first-time setup).
 */
export async function seedDatabase(people: Person[]): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase not configured');
    }

    // Check if database already has data
    const { count } = await supabase
        .from('people')
        .select('*', { count: 'exact', head: true });

    if (count && count > 0) {
        console.log('Database already has data, skipping seed.');
        return;
    }

    // Insert all people first (without spouse references to avoid FK issues)
    const rows = people.map(p => {
        const row = personToRow(p);
        return { ...row, spouse_id: null }; // defer spouse
    });

    const { error: insertError } = await supabase
        .from('people')
        .insert(rows);

    if (insertError) throw insertError;

    // Update spouse references
    for (const person of people) {
        if (person.spouseId) {
            await supabase
                .from('people')
                .update({ spouse_id: person.spouseId })
                .eq('id', person.id);
        }
    }

    // Insert parent-child relationships
    const relations: { parent_id: string; child_id: string }[] = [];
    for (const person of people) {
        for (const parentId of person.parentIds) {
            relations.push({ parent_id: parentId, child_id: person.id });
        }
    }

    if (relations.length > 0) {
        const { error: relError } = await supabase
            .from('parent_child')
            .insert(relations);

        if (relError) throw relError;
    }

    console.log(`✅ Seeded ${people.length} people into database.`);
}

// ============================================
// Activity Log Functions
// ============================================

export async function fetchLogs(): Promise<ActivityLog[]> {
    let logs: ActivityLog[] = [];

    // 1. Try Supabase
    if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (!error && data) {
            logs = data.map((row: any) => ({
                id: row.id,
                personId: row.person_id,
                personName: row.person_name,
                action: row.action,
                details: row.details,
                createdAt: row.created_at
            }));
            return logs;
        }
    }

    // 2. Fallback to LocalStorage
    try {
        const localLogs = localStorage.getItem('familyTreeLogs');
        if (localLogs) {
            logs = JSON.parse(localLogs);
        }
    } catch (e) {
        console.error('Failed to parse local logs', e);
    }

    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

async function createLog(log: Omit<ActivityLog, 'id' | 'createdAt'>) {
    const newLog: ActivityLog = {
        id: crypto.randomUUID(),
        ...log,
        createdAt: new Date().toISOString()
    };

    // 1. Try Supabase
    if (isSupabaseConfigured && supabase) {
        try {
            const { error } = await supabase.from('activity_logs').insert({
                id: newLog.id,
                person_id: log.personId,
                person_name: log.personName,
                action: log.action,
                details: log.details,
                created_at: newLog.createdAt
            });
            if (!error) return; // Success
        } catch (err) {
            console.warn('Supabase log failed, falling back to local:', err);
        }
    }

    // 2. Fallback to LocalStorage
    try {
        const existingInfo = localStorage.getItem('familyTreeLogs');
        const logs: ActivityLog[] = existingInfo ? JSON.parse(existingInfo) : [];
        logs.unshift(newLog); // Add to beginning
        // Keep limit ~50
        if (logs.length > 50) logs.pop();
        localStorage.setItem('familyTreeLogs', JSON.stringify(logs));
    } catch (e) {
        console.error('Failed to save log locally', e);
    }
}

function generateDiff(oldP: Person, newP: Person): string {
    const changes: string[] = [];

    if (oldP.firstName !== newP.firstName) changes.push(`Nama depan: ${oldP.firstName} -> ${newP.firstName}`);
    if (oldP.lastName !== newP.lastName) changes.push(`Nama belakang: ${oldP.lastName} -> ${newP.lastName}`);
    if (oldP.birthDate !== newP.birthDate) changes.push(`Tgl Lahir: ${oldP.birthDate || '-'} -> ${newP.birthDate || '-'}`);
    if (oldP.deathDate !== newP.deathDate) changes.push(`Tgl Wafat: ${oldP.deathDate || '-'} -> ${newP.deathDate || '-'}`);
    if (oldP.gender !== newP.gender) changes.push(`Gender: ${oldP.gender} -> ${newP.gender}`);
    if (oldP.occupation !== newP.occupation) changes.push(`Pekerjaan berubah`);
    if (oldP.location !== newP.location) changes.push(`Lokasi berubah`);
    if (oldP.bio !== newP.bio) changes.push(`Bio berubah`);
    if (oldP.photo !== newP.photo) changes.push(`Foto diubah`);

    if (changes.length === 0) return 'Melakukan perubahan data kecil/relasi';
    return changes.join(', ');
}
