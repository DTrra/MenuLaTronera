import React, { useState, useEffect, useMemo } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

// --- CONFIGURACIÓN FIREBASE (usando variables de entorno de Vercel/Vite) ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicialización segura de Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Colección de Firestore
const getMenuCollectionRef = (dbInstance) =>
  collection(dbInstance, "pizzeria_menu");

// Credenciales del propietario
const OWNER_CREDENTIALS = {
  username: "dasdasTERRA",
  password: "TerraCava2066-+"
};

// --- ALERT PERSONALIZADO ---
const CustomAlert = ({ message, type, onClose }) => {
  if (!message) return null;
  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-xl text-white font-semibold transition-opacity duration-300 z-50 max-w-sm ${
        type === "error" ? "bg-red-600" : "bg-green-500"
      }`}
    >
      {message}
      <button onClick={onClose} className="ml-4 font-bold">
        X
      </button>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const App = () => {
  const [menu, setMenu] = useState([]);
  const [order, setOrder] = useState({});
  const [isLoggedInOwner, setIsLoggedInOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    orderType: "delivery",
    address: "",
    timeSlot: ""
  });

  const showAlert = (msg, type = "success") => {
    setAlertMessage({ msg, type });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  // --- AUTENTICACIÓN ANÓNIMA ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) await signInAnonymously(auth);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- ESCUCHAR MENÚ ---
  useEffect(() => {
    const menuRef = getMenuCollectionRef(db);
    const unsubscribe = onSnapshot(menuRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setMenu(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- FUNCIONES CARRITO ---
  const addItemToCart = (id) =>
    setOrder((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

  const removeItemFromCart = (id) =>
    setOrder((prev) => {
      const copy = { ...prev };
      if (copy[id] > 1) copy[id]--;
      else delete copy[id];
      return copy;
    });

  const cartItems = useMemo(
    () =>
      menu
        .filter((item) => order[item.id] > 0)
        .map((item) => ({
          ...item,
          quantity: order[item.id],
          subtotal: item.price * order[item.id]
        })),
    [menu, order]
  );

  const totalOrder = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.subtotal, 0),
    [cartItems]
  );

  // --- ENVIAR PEDIDO POR WHATSAPP ---
  const sendWhatsAppOrder = () => {
    if (cartItems.length === 0)
      return showAlert("El carrito está vacío", "error");

    const phone = "541150550793";
    let msg = `¡Hola! Soy ${customerDetails.name}.\nMi pedido:\n`;
    cartItems.forEach((i) => {
      msg += `- ${i.quantity}x ${i.name} ($${i.subtotal.toFixed(2)})\n`;
    });
    msg += `\nTotal: $${totalOrder.toFixed(2)}\n`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setOrder({});
    showAlert("Pedido enviado con éxito");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 font-semibold">Cargando menú...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-red-700 text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-3xl font-bold">🍕 Pizzería Online</h1>
        <button
          onClick={() => setShowLogin(true)}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full font-semibold"
        >
          Login Propietario
        </button>
      </header>

      <main className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-red-700 border-b pb-2">
            Nuestro Menú
          </h2>
          {menu.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md p-4 flex flex-col"
            >
              <h3 className="text-lg font-bold text-red-600">{item.name}</h3>
              <p>{item.description}</p>
              <p className="text-xl font-semibold">${item.price}</p>
              <div className="flex mt-2 space-x-2">
                <button
                  onClick={() => removeItemFromCart(item.id)}
                  className="bg-red-400 px-3 py-1 rounded text-white"
                >
                  -
                </button>
                <span>{order[item.id] || 0}</span>
                <button
                  onClick={() => addItemToCart(item.id)}
                  className="bg-green-500 px-3 py-1 rounded text-white"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Carrito */}
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
            🛒 Tu Pedido
          </h2>
          {cartItems.length === 0 ? (
            <p className="text-gray-500 italic">Vacío</p>
          ) : (
            <>
              {cartItems.map((i) => (
                <p key={i.id}>
                  {i.quantity}x {i.name} (${i.subtotal.toFixed(2)})
                </p>
              ))}
              <p className="font-bold mt-4">Total: ${totalOrder.toFixed(2)}</p>
              <button
                onClick={sendWhatsAppOrder}
                className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
              >
                Enviar por WhatsApp
              </button>
            </>
          )}
        </div>
      </main>

      {alertMessage && (
        <CustomAlert
          message={alertMessage.msg}
          type={alertMessage.type}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </div>
  );
};

export default App;
