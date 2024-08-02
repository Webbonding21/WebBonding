import React, { useState, useRef } from "react";
import Modal from "react-modal";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import {
    FaGlobe,
    FaMobileAlt,
    FaShoppingCart,
    FaLightbulb,
    FaEllipsisH,
    FaLaptop,
    FaDesktop,
    FaMobile,
    FaMixcloud
} from "react-icons/fa";
import axios from 'axios';
import "../assets/StepForModal.css";

Modal.setAppElement('#root');

const StepForModal = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [correo, setCorreo] = useState("");
    const [description, setDescription] = useState("");
    const [option, setOption] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const form = useRef();

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setStep(1);
        setName("");
        setCorreo("");
        setDescription("");
        setOption("");
        setError("");
        setSuccess("");
    };

    const handleNextStep = () => {
        if (step === 1 && name !== "" && correo !== "") {
            setStep(step + 1);
        } else if (step === 2 && option !== "") {
            setStep(step + 1);
        } else if (step === 3 && description !== "") {
            setStep(step + 1);
        }
    };

    const handlePreviousStep = () => {
        setStep(step - 1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const clientData = {
            name: name,
            email: correo,
            message: description,
            option: option
        };

        axios.post('https://webbondingmailer.onrender.com/api/clients', clientData)
            .then(response => {
                if (response.data.error) {
                    setError(response.data.error);
                } else {
                    setSuccess("¡Correo enviado con éxito! Nuestro equipo se pondrá en contacto contigo muy pronto.");
                    closeModal();
                    console.log("Correo enviado");
                }
            })
            .catch((error) => {
                console.error("Error enviando el correo:", error);
                setError("Hubo un problema enviando el correo. Por favor, inténtalo de nuevo.");
            });
    };

    const optionCards = [
        { value: "Sitio web", label: "Sitio web", icon: <FaGlobe /> },
        { value: "App web", label: "App web", icon: <FaMobileAlt /> },
        { value: "E-commerce", label: "E-commerce", icon: <FaShoppingCart /> },
        { value: "Consultoría", label: "Consultoría", icon: <FaLightbulb /> },
        { value: "Software", label: "Software", icon: <FaLaptop /> },
        { value: "App de escritorio", label: "App de escritorio", icon: <FaDesktop /> },
        { value: "App móvil", label: "App móvil", icon: <FaMobile /> },
        { value: "API", label: "API", icon: <FaMixcloud /> },
        { value: "Otro", label: "Otro", icon: <FaEllipsisH /> }
    ];

    return (
        <div>
            <button onClick={openModal} className="open-modal-button">
                Crea tu Transformación Digital
            </button>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Contact Form"
                className="modal"
                overlayClassName="overlay"
            >
                <form ref={form} onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div className="step">
                            <h3><span>¡Buen día! ☀️</span> <br /> Ingresa tu nombre y correo, por favor. 📝😊</h3>
                            <p>Recuerda que consultar es totalmente gratis.</p>
                            <input
                                name="user_name"
                                type="text"
                                placeholder="Tu nombre"
                                autoComplete="off"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                                required
                            />
                            <input
                                name="user_email"
                                type="email"
                                placeholder="Correo"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                required
                            />
                            <button onClick={handleNextStep} className="next-button" disabled={!name || !correo}>
                                <FaArrowRight />
                            </button>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="step">
                            <p>¡Hola, {name}! 😊<br /><br />
                                Bienvenido a <strong>Web Bonding</strong>, donde transformamos ideas en experiencias digitales. <br /><br />
                                ¿Qué tipo de solución digital necesitas?<br /><br /></p>
                            <div className="options">
                                {optionCards.map((card) => (
                                    <div
                                        key={card.value}
                                        className={`option-card ${option === card.value ? 'selected' : ''}`}
                                        onClick={() => setOption(card.value)}
                                    >
                                        {card.icon}
                                        <p>{card.label}</p>
                                    </div>
                                ))}
                            </div>
                            <input type="hidden" name="solution_option" value={option} />
                            <button onClick={handlePreviousStep} className="prev-button">
                                <FaArrowLeft />
                            </button>
                            <button onClick={handleNextStep} className="next-button" disabled={!option}>
                                <FaArrowRight />
                            </button>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="step">
                            <p>¡Ya casi terminamos, {name}! 😊<br /><br />
                                ¿Podrías describir más detalles sobre la solución digital que necesitas? 💼🚀<br />
                                <br />En este caso escogiste la solución <strong>{option}</strong><br /><br />
                                Recuerda <strong>{name}</strong>. Estamos aquí para hacer de tu negocio una papaya. 💡</p>
                            <textarea
                                name="message"
                                placeholder="Describe lo mejor que puedas qué solución digital necesitas y nuestro equipo te contactará"
                                value={description}
                                autoComplete="off"
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                            <button onClick={handlePreviousStep} className="prev-button">
                                <FaArrowLeft />
                            </button>
                            <button onClick={handleNextStep} className="next-button" disabled={!description}>
                                <FaArrowRight />
                            </button>
                        </div>
                    )}
                    {step === 4 && (
                        <div className="step">
                            <p>¡Perfecto, {name}! 😃<br /><br />
                                Nuestro equipo se pondrá en contacto contigo muy pronto.🧐</p>
                            <button onClick={handlePreviousStep} className="prev-button">
                                <FaArrowLeft />
                            </button>
                            <button type="submit" className="next-button">
                                Enviar
                            </button>
                        </div>
                    )}
                </form>
            </Modal>
        </div>
    );
};

export default StepForModal;
