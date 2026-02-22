import * as userAccountDb from '../database/userAccount.db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';

export const createUserAccount = async (data) => {
  const passwordHash = await bcrypt.hash(data.uaPasswordHash, 10)
  return await userAccountDb.createUserAccount({
    ...data,
    uaPasswordHash: passwordHash
  })
}

export const getAllUserAccounts = async () => {
  return await userAccountDb.getAllUserAccounts()
}

export const getUserAccountById = async (uaId) => {
  return await userAccountDb.getUserAccountById(uaId)
}

export const searchUserAccounts = async (query) => {
  return await userAccountDb.searchUserAccounts(query)
}

export const updateUserAccount = async (uaId, updates) => {
  if (updates.uaPasswordHash) {
    updates.uaPasswordHash = await bcrypt.hash(updates.uaPasswordHash, 10)
  }
  return await userAccountDb.updateUserAccount(uaId, updates)
}

export const deleteUserAccount = async (uaId) => {
  const account = await userAccountDb.getUserAccountById(uaId)
  if (!account) throw new Error('User account not found')
  return await userAccountDb.deleteUserAccount(uaId)
}

export const loginUserAccount = async (uaEmail, uaPassword) => {
  const account = await userAccountDb.getUserAccountByEmail(uaEmail);

  if (!account) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(uaPassword, account.uaPasswordHash);

  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    {
      uaId: account.uaId,
      uaEmail: account.uaEmail,
      uaUserProfileId: account.uaUserProfileId,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    account: {
      uaId: account.uaId,
      uaEmail: account.uaEmail,
      uaUsername: account.uaUsername,
      uaUserProfileId: account.uaUserProfileId,
    },
  };
};

export const loginAdminUserAccount = async (uaEmail, uaPassword) => {
  const account = await userAccountDb.getUserAccountByEmail(uaEmail);

  if (!account) {
    throw new Error('Invalid email or password');
  }

  console.log('uaUserProfileId:', account.uaUserProfileId);
  console.log('type:', typeof account.uaUserProfileId);

  if (account.uaUserProfileId != 1) {
    throw new Error('Access denied. Admins only.');
  }

  const isMatch = await bcrypt.compare(uaPassword, account.uaPasswordHash);

  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    {
      uaId: account.uaId,
      uaEmail: account.uaEmail,
      uaUserProfileId: account.uaUserProfileId,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    account: {
      uaId: account.uaId,
      uaEmail: account.uaEmail,
      uaUsername: account.uaUsername,
      uaUserProfileId: account.uaUserProfileId,
    },
  };
};