import React, { useEffect, useState } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

const CREDENTIALS = { user: "dasdasTERRA", pass: "TerraCava2066-+" };

const Admin = () => {
  const [auth, setAuth] = useState(false);
  const [login, setLogin] = useState({ user: "", pass: "" });
  const [menu, setMenu] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", description: "", price: "" });

  useEffect(() => {
    if (!auth) return;
    const unsub = onSnapshot(collection(db, "pizzeria_menu"), (snap) => {
      setMenu(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [auth]);

  const handleLogin = () => {
    if (login.user === CREDENTIALS.user && login.pass === CREDENTIALS.pass)
      setAuth(true);
    else alert("Credenciales incorrectas");
  };

  const addItem = async () => {
    if (!newItem.name || !newItem.price) return alert("Completa los campos");
    await addDoc(collection(db, "pizzeria_menu"), {
      ...newItem,
      price: parseFloat(newItem.price)
    });
    setNewItem({ name: "", description: "", price: "" });
  };

  const updateItem = async (id, field, value) =>
    await updateDoc(doc(db, "pizzeria_menu", id), { [field]: value });

  const deleteItem = async (id) => await deleteDoc(doc(db, "pizzeria_menu", id));

  if (!auth)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-2xl font-bold text-center text-red-600">Login Admin</h2>
          <input
            placeholder="Usuario"
            value={login.user}
            onChange={(e) => setLogin({ ...login, user: e.target.value })}
            className="border p-2 w-full rounded"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={login.pass}
            onChange={(e) => setLogin({ ...login, pass: e.target.value })}
            className="border p-2 w-full rounded"
          />
          <button
            onClick={handleLogin}
            className="bg-red-600 text-white px-4 py-2 rounded w-full"
          >
            Entrar
          </button>
        </div>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-red-700 mb-4">Panel de Administración</h1>

      {/* Agregar nuevo */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Agregar nuevo producto</h2>
        <input
          placeholder="Nombre"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <input
          placeholder="Descripción"
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <input
          type="number"
          placeholder="Precio"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <button onClick={addItem} className="bg-green-500 text-white px-4 py-2 rounded">
          Agregar
        </button>
      </div>

      {/* Lista actual */}
      <div className="space-y-3">
        {menu.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded shadow-md flex justify-between">
            <div className="flex-1">
              <input
                value={item.name}
                onChange={(e) => updateItem(item.id, "name", e.target.value)}
                className="border p-1 rounded mr-2"
              />
              <input
                value={item.price}
                type="number"
                onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value))}
                className="border p-1 rounded w-24"
              />
            </div>
            <button
              onClick={() => deleteItem(item.id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
