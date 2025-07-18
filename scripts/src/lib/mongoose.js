"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
var mongoose_1 = require("mongoose");
var mongodb_1 = require("mongodb");
// MongoDB URI from environment variable
var MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}
// Type assertion after the check
var mongoUri = MONGODB_URI;
// Mongoose connection
var cached = global.mongooseConnection;
if (!cached) {
    cached = global.mongooseConnection = { conn: null, promise: null };
}
function connectDB() {
    return __awaiter(this, void 0, void 0, function () {
        var opts, _a, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (cached.conn) {
                        return [2 /*return*/, cached.conn];
                    }
                    if (!cached.promise) {
                        opts = {
                            bufferCommands: false,
                            maxPoolSize: 5, // cPanel için düşük - hosting kaynak limitleri
                            serverSelectionTimeoutMS: 5000, // Hızlı timeout
                            socketTimeoutMS: 30000, // 30s socket timeout
                            maxIdleTimeMS: 30000, // 30s idle timeout
                            // Connection maintenance
                            heartbeatFrequencyMS: 10000,
                            maxStalenessSeconds: 90,
                        };
                        cached.promise = mongoose_1.default.connect(mongoUri, opts);
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    _a = cached;
                    return [4 /*yield*/, cached.promise];
                case 2:
                    _a.conn = _b.sent();
                    console.log('✅ MongoDB (Mongoose) bağlantısı başarılı');
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _b.sent();
                    cached.promise = null;
                    console.error('❌ MongoDB (Mongoose) bağlantı hatası:', e_1);
                    throw e_1;
                case 4: return [2 /*return*/, cached.conn];
            }
        });
    });
}
// MongoClient connection for other operations
var clientCached = global.mongoClientConnection;
if (!clientCached) {
    clientCached = global.mongoClientConnection = { client: null, promise: null };
}
function connectToDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var options, client, _a, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (clientCached.client) {
                        return [2 /*return*/, { client: clientCached.client, db: clientCached.client.db() }];
                    }
                    if (!clientCached.promise) {
                        options = {
                            maxPoolSize: 5,
                            serverSelectionTimeoutMS: 5000,
                            socketTimeoutMS: 30000,
                        };
                        client = new mongodb_1.MongoClient(mongoUri, options);
                        clientCached.promise = client.connect();
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    _a = clientCached;
                    return [4 /*yield*/, clientCached.promise];
                case 2:
                    _a.client = _b.sent();
                    console.log('✅ MongoDB (Client) bağlantısı başarılı');
                    return [2 /*return*/, { client: clientCached.client, db: clientCached.client.db() }];
                case 3:
                    e_2 = _b.sent();
                    clientCached.promise = null;
                    console.error('❌ MongoDB (Client) bağlantı hatası:', e_2);
                    throw e_2;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Connection cleanup for cPanel
process.on('SIGINT', function () { return __awaiter(void 0, void 0, void 0, function () {
    var err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                if (!cached.conn) return [3 /*break*/, 2];
                return [4 /*yield*/, cached.conn.disconnect()];
            case 1:
                _a.sent();
                console.log('MongoDB Mongoose connection closed.');
                _a.label = 2;
            case 2:
                if (!clientCached.client) return [3 /*break*/, 4];
                return [4 /*yield*/, clientCached.client.close()];
            case 3:
                _a.sent();
                console.log('MongoDB Client connection closed.');
                _a.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                err_1 = _a.sent();
                console.error('Error closing MongoDB connections:', err_1);
                return [3 /*break*/, 6];
            case 6:
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); });
exports.default = connectDB;
