import React, { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const LoginPage = () => {
    const { loginUser } = useContext(AuthContext);

    const handleSubmit = (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        loginUser(email, password);
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" name="email" placeholder="E-Mail-Adresse" required />
                <br />
                <input type="password" name="password" placeholder="Passwort" required />
                <br />
                <button type="submit">Einloggen</button>
            </form>
            <p>
                Noch kein Konto? <Link to="/register">Hier registrieren</Link>
            </p>
        </div>
    );
};

export default LoginPage;
