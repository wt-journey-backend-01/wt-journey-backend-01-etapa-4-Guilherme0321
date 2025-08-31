import db from "../db/db";

export interface Usuario {
    id?: number;
    nome: string;
    email: string;
    senha: string;
    created_at?: Date;
    updated_at?: Date;
}

export async function findByEmail(email: string): Promise<Usuario | undefined> {
    return await db('usuarios').where('email', email).first();
}

export async function findById(id: number): Promise<Usuario | undefined> {
    return await db('usuarios').where('id', id).first();
}

export async function create(usuario: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>): Promise<Usuario[]> {
    return await db('usuarios').insert(usuario).returning('*');
}

export async function deleteById(id: number): Promise<number> {
    return await db('usuarios').where('id', id).del();
}

export async function findAll(): Promise<Usuario[]> {
    return await db('usuarios').select('*');
}
