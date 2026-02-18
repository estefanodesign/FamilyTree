export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  deathDate?: string;
  gender: 'male' | 'female' | 'other';
  photo?: string;
  bio?: string;
  occupation?: string;
  location?: string;
  spouseId?: string;
  parentIds: string[];
  childrenIds: string[];
}

export interface Position {
  x: number;
  y: number;
}

export interface NodePosition extends Position {
  person: Person;
  level: number;
  index: number;
}

export interface Connection {
  from: NodePosition;
  to: NodePosition;
  type: 'parent-child' | 'spouse';
}

export interface ActivityLog {
  id: string;
  personId?: string;
  personName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  details: string;
  createdAt: string;
}
