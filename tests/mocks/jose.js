// Mock for jose library
module.exports = {
  jwtVerify: jest.fn(),
  SignJWT: jest.fn(),
  importSPKI: jest.fn(),
  importPKCS8: jest.fn(),
  compactDecrypt: jest.fn(),
  compactEncrypt: jest.fn(),
  EncryptJWT: jest.fn(),
  DecryptJWT: jest.fn(),
};
