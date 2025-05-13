import { ID, OAuthProvider, Query } from "appwrite"
import { account, appwriteConfig, database } from "./client"
import { redirect } from "react-router"
import { ap } from "node_modules/react-router/dist/development/route-data-C6QaL0wu.mjs"

export const loginWithGoogle = async () => {
    try {
        account.createOAuth2Session(OAuthProvider.Google)
    } catch(e) {
        console.log('loginWithGoogle: ', e)
    }
}

export const getUser = async () => {
   try {
        const user = await account.get();
        if (!user) return redirect("/sign-in");

        const { documents } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [
                Query.equal("accountId", user.$id),
                Query.select(["name", "email", "imageUrl", "joinedAt", "accountId"]),
            ]
        );

        return documents.length > 0 ? documents[0] : redirect("/sign-in");
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

export const logoutUser = async () => {
     try {
        await account.deleteSession("current");
    } catch (e) {
        console.log("logoutUser: ", e);
    }
}

const getGooglePicture = async (accessToken : string) => {
    try {
    // Make a request to Google People API to get the profile photo
        const response = await fetch(
            "https://people.googleapis.com/v1/people/me?personFields=photos", {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        if (!response.ok) throw new Error("Failed to fetch Google profile picture")

        const { photos } = await response.json();
        return photos?.[0]?.url || null;
    } catch(e) {
        console.error("getGooglePicture: ", e)
        return null;
    }
}

export const storeUserData = async () => {
    try {
        const user = await account.get()
        if (!user) 
            throw new Error("User not found")
        const { providerAccessToken } = (await account.getSession("current")) || {}
        const profilePicture = providerAccessToken ? await getGooglePicture(providerAccessToken) : null

        const createdUser = await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                accountId: user.$id,
                email: user.email,
                name: user.name,
                imageUrl: profilePicture,
                joinedAt: new Date().toISOString(),
            }
        )

        if (!createdUser.$id)
            redirect("/sign-in")
    } catch(e) {
        console.log("storeUserData: ", e)
    }
}

export const getExistingUser = async (id: string) => {
    try {
        // Check if user exists in the database
        const { documents, total } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", id)]
        )
        return total > 0 ? documents[0] : null
    } catch(e) {
        console.log("getExistingUser: ", e)
        return null
    }
}

export const getAllUsers = async (limit: number, offset: number) => {
    try {
        const { documents: users, total } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.limit(limit), Query.offset(offset)]
        )

        if (total == 0)
            return { user: [], total }
        return { users, total }
    }
    catch(e) {
        console.log("getAllUsers: ", e)
        return { user: [], total: 0 }
    }
}