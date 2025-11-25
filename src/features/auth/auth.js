import { supabase } from "../../../supabase.js";

/**
 * Sign up a user with email and password.
 * @params {string} email
 * @params {string} password
 * @returns {Promise<object>} object containing "user" and "session".
 * @throws {Error} if sign up fails.
**/
export async function signUpWithEmail(email, password, ) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password

    })
    if (error) { throw error; }
    return data;
}

export async function loginWithEmail(email, password) {

}