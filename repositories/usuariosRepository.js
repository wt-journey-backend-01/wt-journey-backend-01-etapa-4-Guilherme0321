"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByEmail = findByEmail;
exports.findById = findById;
exports.create = create;
exports.deleteById = deleteById;
exports.findAll = findAll;
const db_1 = __importDefault(require("../db/db"));
async function findByEmail(email) {
    return await (0, db_1.default)('usuarios').where('email', email).first();
}
async function findById(id) {
    return await (0, db_1.default)('usuarios').where('id', id).first();
}
async function create(usuario) {
    return await (0, db_1.default)('usuarios').insert(usuario).returning('*');
}
async function deleteById(id) {
    return await (0, db_1.default)('usuarios').where('id', id).del();
}
async function findAll() {
    return await (0, db_1.default)('usuarios').select('*');
}
