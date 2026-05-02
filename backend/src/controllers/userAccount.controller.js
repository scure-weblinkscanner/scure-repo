import * as userAccountService from '../services/userAccount.service.js';

export const createUserAccount = async (req, res) => {
  try {
    const { uaUsername, uaEmail, uaPasswordHash, uaUserProfileId } = req.body;
    if (!uaUsername || !uaEmail || !uaPasswordHash) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }
    const data = { uaUsername, uaEmail, uaPasswordHash };
    if (uaUserProfileId) data.uaUserProfileId = uaUserProfileId;
    const result = await userAccountService.createUserAccount(data);
    res.status(201).json(result);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists.' });
    }
    console.error(error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
};

export const getAllUserAccounts = async (req, res) => {
  try {
    const result = await userAccountService.getAllUserAccounts();
    res.status(200).json(result);
  } catch (error) {
    console.error(error); res.status(500).json({ error: 'Something went wrong.' });
  }
};

export const getUserAccountById = async (req, res) => {
  try {
    const isAdmin = req.user.uaUserProfileId === 1;
    const isSelf = String(req.params.uaId) === String(req.user.uaId);

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await userAccountService.getUserAccountById(req.params.uaId);
    if (!result) return res.status(404).json({ error: 'User account not found' });
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
};

export const searchUserAccounts = async (req, res) => {
  try {
    const result = await userAccountService.searchUserAccounts(req.query.q);
    res.status(200).json(result);
  } catch (error) {
    console.error(error); res.status(500).json({ error: 'Something went wrong.' });
  }
};

export const updateUserAccount = async (req, res) => {
  try {
    const isAdmin = req.user.uaUserProfileId === 1;
    const isSelf = String(req.params.uaId) === String(req.user.uaId);

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await userAccountService.updateUserAccount(req.params.uaId, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
};

export const deleteUserAccount = async (req, res) => {
  try {
    const isAdmin = req.user.uaUserProfileId === 1;
    const isSelf = String(req.params.uaId) === String(req.user.uaId);

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await userAccountService.deleteUserAccount(req.params.uaId);
    res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
};

export const loginUserAccount = async (req, res) => {
  try {
    const { uaEmail, uaPassword } = req.body;
    if (!uaEmail || !uaPassword) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const result = await userAccountService.loginUserAccount(uaEmail, uaPassword);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: 'Invalid email or password' });
  }
};

export const loginAdminUserAccount = async (req, res) => {
  try {
    const { uaEmail, uaPassword } = req.body;
    if (!uaEmail || !uaPassword) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const result = await userAccountService.loginAdminUserAccount(uaEmail, uaPassword);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const checkEmailExists = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const record = await userAccountService.checkEmailExists(email);
    res.status(200).json({ exists: record !== null });
  } catch (error) {
    console.error(error); res.status(500).json({ error: 'Something went wrong.' });
  }
};
