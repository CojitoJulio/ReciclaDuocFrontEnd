import { createContext, useContext, useEffect, useState } from "react";

const RecycleCtx = createContext();

export function RecycleProvider({ children }) {
    const [items, setItems] = useState(() => {
        try {
            const raw = localStorage.getItem("recycle_items");
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    });

    useEffect(() => {
        localStorage.setItem("recycle_items", JSON.stringify(items));
    }, [items]);

    const addItem = (item) => setItems((prev) => [item, ...prev]);
    const removeItem = (id) => setItems((prev) => prev.filter(i => i.id !== id));
    const clearItems = () => setItems([]);

    return (
        <RecycleCtx.Provider value={{ items, addItem, removeItem, clearItems }}>
            {children}
        </RecycleCtx.Provider>
    );
}

export const useRecycleStore = () => useContext(RecycleCtx);
