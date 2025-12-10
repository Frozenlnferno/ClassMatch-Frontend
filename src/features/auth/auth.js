import { supabase } from "../../../supabase.js";

/**
 * Sign up a user with email and password.
 * @params {string} email of user
 * @params {string} password of user
 * @params {string} name of user
 * @returns {Promise<object>} object containing "user" and "session".
 * @throws {Error} if sign up fails.
**/
export async function signUpWithEmail(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name
            }
        }
    })
    if (error) { throw error; }
    return data;
}

/**
 * Login a user with email and password.
 * @params {string} email of user
 * @params {string} password of user
 * @returns {Promise<object>} object containing "user" and "session".
 * @throws {Error} if login fails.
**/
export async function loginWithEmail(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })
    if (error) { throw error; }
    return data;
}

/**
 * Log outs the current user.
 * @returns {Promise<void>}
 * @throws {Error} if logout fails.
**/
export async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) { throw error; }
    return;
}