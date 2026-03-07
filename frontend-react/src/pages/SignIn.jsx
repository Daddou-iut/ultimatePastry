import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API_URL from '../config';

export const SignIn = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/register/`, {
                method: 'POST',
                headers: {  
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    first_name,
                    last_name,
                    password
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                // Sauvegarde le token et username
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.user.username);
                
                // Affiche le message de succès
                setSuccess('Inscription réussie ! Bienvenue 🎉');
                
                // Redirige vers l'inventaire après 1.5s
                setTimeout(() => navigate('/inventory'), 1500);
            } else {
                setError(data.error || data.message || 'Erreur lors de l\'inscription');
            }
        } catch (err) {
            console.error('Erreur:', err);
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-2xl p-2 w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-gray-800 mb-2">
                        🎂 Ultimate Pâtisserie
                    </h1>
                    <p className="text-gray-600">Crée ton compte</p>
                </div>

                {/* Message d'erreur */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-4 bg-red-100 border-l-4 border-red-500 p-4 rounded"
                    >
                        <p className="text-red-700 font-semibold">❌ {error}</p>
                    </motion.div>
                )}

                {/* Message de succès */}
                {success && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-4 bg-green-100 border-l-4 border-green-500 p-4 rounded"
                    >
                        <p className="text-green-700 font-semibold">✅ {success}</p>
                    </motion.div>
                )}

                {/* Formulaire */}
                <form onSubmit={handleSignIn} className="space-y-4">
                    {/* Username */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">
                            Nom d'utilisateur
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none transition"
                            placeholder="Entre ton nom d'utilisateur"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">
                            Adresse e-mail
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none transition"
                            placeholder="ton-email@example.com"
                            required
                        />
                    </div>

                    {/* Prénom */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">
                            Prénom
                        </label>
                        <input
                            type="text"
                            value={first_name}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none transition"
                            placeholder="Ton prénom"
                            required
                        />
                    </div>

                    {/* Nom */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">
                            Nom
                        </label>
                        <input
                            type="text"
                            value={last_name}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none transition"
                            placeholder="Ton nom"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none transition"
                            placeholder="Entre ton mot de passe"
                            required
                        />
                    </div>

                    {/* Bouton Submit */}
                    <motion.button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-bold text-white transition ${
                            loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-lg'
                        }`}
                        whileHover={!loading ? { scale: 1.02 } : {}}
                        whileTap={!loading ? { scale: 0.98 } : {}}
                    >
                        {loading ? 'Création en cours...' : 'Créer un compte'}
                    </motion.button>
                </form>

                {/* Lien vers Login */}
                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Tu as déjà un compte?{' '}
                        <Link to="/login" className="text-pink-500 font-bold hover:underline">
                            Connecte-toi
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};
