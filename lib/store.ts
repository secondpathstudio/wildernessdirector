import {create} from "zustand"

type UserStore = {
    role: string;
    setRole: (role: string) => void;
    uid: string;
    setUid: (uid: string) => void;
}

export const useUserStore = create<UserStore>((set) => ({
    uid: "",
    role: "",
    setRole: (role) => set({ role }),
    setUid: (uid) => set({ uid })
}))