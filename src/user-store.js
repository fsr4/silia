class UserStore {
    #users = new Map();

    storeUserinfo(userId, userinfo) {
        this.#users.set(userId, userinfo);
    }

    hasUserinfo(userId) {
        return this.#users.has(userId);
    }

    getUserinfo(userId) {
        return this.#users.get(userId);
    }
}

const userStore = new UserStore();

export default userStore;
