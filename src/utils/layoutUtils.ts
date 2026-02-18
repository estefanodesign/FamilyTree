import { Person, NodePosition } from '@/types/family';

// Constants for layout
const NODE_WIDTH = 220;
// const NODE_HEIGHT = 100; // Not used in layout calc directly but for spacing
const VERTICAL_SPACING = 220;
const SPOUSE_SPACING = 60;
const SIBLING_SPACING = 400;

export const calculateLayout = (people: Person[]): Map<string, NodePosition> => {
    const positions = new Map<string, NodePosition>();
    const levels = new Map<string, number>();
    const subtreeWidths = new Map<string, number>();
    const familyGroups = new Map<string, string>(); // Maps person to their family group id

    // Helper: Get family unit id (the person with smaller id in couple)
    const getFamilyId = (person: Person): string => {
        if (!person.spouseId) return person.id;
        return person.id < person.spouseId ? person.id : person.spouseId;
    };

    // Helper: Calculate family width (person + spouse)
    const getFamilyWidth = (person: Person): number => {
        return person.spouseId ? NODE_WIDTH * 2 + SPOUSE_SPACING : NODE_WIDTH;
    };

    // Helper: Calculate subtree width recursively for a family unit
    const calculateSubtreeWidth = (personId: string, visited: Set<string>): number => {
        if (visited.has(personId)) return 0;

        const person = people.find(p => p.id === personId);
        if (!person) return 0;

        // Mark both spouses as visited
        visited.add(person.id);
        if (person.spouseId) visited.add(person.spouseId);

        // Store family group
        const familyId = getFamilyId(person);
        familyGroups.set(person.id, familyId);
        if (person.spouseId) familyGroups.set(person.spouseId, familyId);

        if (person.childrenIds.length === 0) {
            // Leaf node
            const width = getFamilyWidth(person);
            subtreeWidths.set(familyId, width);
            return width;
        }

        // Calculate total width of all children subtrees
        let childrenWidth = 0;
        const children = person.childrenIds
            .map(id => people.find(p => p.id === id))
            .filter((p): p is Person => !!p)
            .sort((a, b) => new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime());

        children.forEach((child, idx) => {
            if (idx > 0) childrenWidth += SIBLING_SPACING;
            const childFamilyId = getFamilyId(child);
            // Only calculate if not already processed
            if (!visited.has(child.id) && !visited.has(child.spouseId || '')) {
                childrenWidth += calculateSubtreeWidth(child.id, visited);
            } else {
                childrenWidth += subtreeWidths.get(childFamilyId) || getFamilyWidth(child);
            }
        });

        // Width is max of family unit width or children total width
        const familyWidth = getFamilyWidth(person);
        const totalWidth = Math.max(familyWidth, childrenWidth);
        subtreeWidths.set(familyId, totalWidth);
        return totalWidth;
    };

    // Find root nodes (oldest generation, no parents in dataset)
    const findRoots = (): Person[] => {
        return people.filter(p =>
            p.parentIds.length === 0 ||
            p.parentIds.every(id => !people.find(x => x.id === id))
        );
    };

    // Calculate levels using BFS
    const calculateLevels = () => {
        const roots = findRoots();
        const queue: Array<{ person: Person; level: number }> = [];
        const visited = new Set<string>();

        roots.forEach(root => {
            if (!visited.has(root.id)) {
                visited.add(root.id);
                levels.set(root.id, 0);
                if (root.spouseId) {
                    visited.add(root.spouseId);
                    levels.set(root.spouseId, 0);
                }
                queue.push({ person: root, level: 0 });
            }
        });

        while (queue.length > 0) {
            const { person, level } = queue.shift()!;

            // Process children
            person.childrenIds.forEach(childId => {
                const child = people.find(p => p.id === childId);
                if (child && !levels.has(child.id)) {
                    levels.set(child.id, level + 1);
                    if (child.spouseId) {
                        levels.set(child.spouseId, level + 1);
                    }
                    queue.push({ person: child, level: level + 1 });
                }
            });
        }
    };

    // Assign positions using post-order traversal
    const assignPositions = () => {
        const assigned = new Set<string>();
        const rootNodes = findRoots();

        // Sort roots by birth year for consistency
        rootNodes.sort((a, b) => new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime());

        let currentX = 0;

        const positionSubtree = (personId: string, level: number, startX: number): number => {
            if (assigned.has(personId)) return startX;

            const person = people.find(p => p.id === personId);
            if (!person) return startX;

            const spouse = person.spouseId ? people.find(p => p.id === person.spouseId) : null;
            const familyWidth = getFamilyWidth(person);

            let familyCenterX: number;

            if (person.childrenIds.length === 0) {
                // Leaf node - position family at startX
                familyCenterX = startX + familyWidth / 2;
            } else {
                // Parent node - center above children
                let childrenStartX = startX;
                let minChildX = Infinity;
                let maxChildX = -Infinity;

                // Sort children by birth year (left = oldest)
                const sortedChildren = person.childrenIds
                    .map(id => people.find(p => p.id === id))
                    .filter((p): p is Person => !!p)
                    .sort((a, b) => new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime());

                // Process children first to determine parent position
                sortedChildren.forEach((child, idx) => {
                    if (idx > 0) {
                        const prevChild = sortedChildren[idx - 1];
                        const prevFamilyId = getFamilyId(prevChild);
                        childrenStartX += (subtreeWidths.get(prevFamilyId) || getFamilyWidth(prevChild));
                        childrenStartX += SIBLING_SPACING;
                    }
                    const childCenterX = positionSubtree(child.id, level + 1, childrenStartX);
                    minChildX = Math.min(minChildX, childCenterX);
                    maxChildX = Math.max(maxChildX, childCenterX);
                });

                // Center parent family above children
                familyCenterX = (minChildX + maxChildX) / 2;

                // Ensure minimum spacing from startX
                if (familyCenterX - familyWidth / 2 < startX) {
                    familyCenterX = startX + familyWidth / 2;
                }
            }

            // Position primary person (left side of family unit)
            const primaryPersonX = familyCenterX - familyWidth / 2 + NODE_WIDTH / 2;

            positions.set(person.id, {
                x: primaryPersonX,
                y: level * VERTICAL_SPACING,
                person,
                level,
                index: 0
            });
            assigned.add(person.id);

            // Position spouse to the right
            if (spouse && !assigned.has(spouse.id)) {
                positions.set(spouse.id, {
                    x: primaryPersonX + NODE_WIDTH + SPOUSE_SPACING,
                    y: level * VERTICAL_SPACING,
                    person: spouse,
                    level,
                    index: 1
                });
                assigned.add(spouse.id);
            }

            return familyCenterX;
        };

        // Position each root family
        rootNodes.forEach(root => {
            if (!assigned.has(root.id)) {
                const rootFamilyId = getFamilyId(root);
                const rootSubtreeWidth = subtreeWidths.get(rootFamilyId) || getFamilyWidth(root);
                positionSubtree(root.id, 0, currentX);
                currentX += rootSubtreeWidth + SIBLING_SPACING;
            }
        });

        // Center the entire tree
        let minX = Infinity, maxX = -Infinity;
        positions.forEach(pos => {
            minX = Math.min(minX, pos.x - NODE_WIDTH / 2);
            maxX = Math.max(maxX, pos.x + NODE_WIDTH / 2);
        });

        const treeCenter = (minX + maxX) / 2;
        positions.forEach(pos => {
            pos.x -= treeCenter;
        });
    };

    // Run layout algorithm
    const roots = findRoots();
    const visited = new Set<string>();
    roots.forEach(root => calculateSubtreeWidth(root.id, visited));
    calculateLevels();
    assignPositions();

    return positions;
};
