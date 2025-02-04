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
import "../assets/StepForModal.css";

Modal.setAppElement('#root');

const StepForModal = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [correo, setCorreo] = useState("");
    const [description, setDescription] = useState("");
    const [option, setOption] = useState("");
    const [errors, setErrors] = useState({ name: "", correo: "" });
    const form = useRef();

    const openModal = () => setModalIsOpen(true);
    const closeModal = () => {
        setModalIsOpen(false);
        setStep(1);
        setName("");
        setCorreo("");
        setDescription("");
        setOption("");
        setErrors({ name: "", correo: "" });
    };

    const validateName = (value) => {
        const nameRegex = /^[a-zA-ZÀ-ÿ\s]{3,40}$/;
        if (!nameRegex.test(value)) {
            setErrors((prev) => ({ ...prev, name: "El nombre debe tener entre 3 y 40 caracteres y solo letras." }));
        } else {
            setErrors((prev) => ({ ...prev, name: "" }));
        }
        setName(value);
    };

    const validateCorreo = (value) => {
        const correoRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!correoRegex.test(value)) {
            setErrors((prev) => ({ ...prev, correo: "Ingresa un correo válido." }));
        } else {
            setErrors((prev) => ({ ...prev, correo: "" }));
        }
        setCorreo(value);
    };

    const handleNextStep = () => {
        if (step === 1 && name && correo && !errors.name && !errors.correo) setStep(step + 1);
        else if (step === 2 && option) setStep(step + 1);
        else if (step === 3 && description) setStep(step + 1);
    };

    const handlePreviousStep = () => setStep(step - 1);

    const handleSubmit = (e) => {
        e.preventDefault();
        const message = `¡Hola, equipo de Web Bonding! 🚀✨\n\nMi nombre es ${name} y me encantaría transformar mi negocio con su ayuda. 🌟\n\n📧 *Correo:* ${correo}\n💡 *Servicio de interés:* ${option}\n📝 *Detalles:* ${description}\n\n¡Estoy emocionado por comenzar esta aventura digital con ustedes! 🤩💻 ¡Espero su respuesta pronto!`;
        const whatsappUrl = `https://wa.me/584121510662?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
        closeModal();
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
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="modal" overlayClassName="overlay">
                <form ref={form} onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div className="step">
                            <h3>¡Buen día! ☀️ Ingresa tu nombre y correo. 📝😊</h3>
                            <input
                                type="text"
                                placeholder="Tu nombre"
                                value={name}
                                onChange={(e) => validateName(e.target.value)}
                                required
                            />
                            {errors.name && <p style={{ color: "red" }} className="error-message">{errors.name}</p>}
                            
                            <input
                                type="email"
                                placeholder="Correo"
                                value={correo}
                                onChange={(e) => validateCorreo(e.target.value)}
                                required
                            />
                            {errors.correo && <p style={{ color: "red" }} className="error-message">{errors.correo}</p>}

                            <button onClick={handleNextStep} className="next-button" disabled={!name || !correo || errors.name || errors.correo}>
                                <FaArrowRight />
                            </button>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="step">
                            <p>Hola, {name}! 😊 ¿Qué tipo de solución digital necesitas?</p>
                            <div className="options">
                                {optionCards.map((card) => (
                                    <div key={card.value} className={`option-card ${option === card.value ? 'selected' : ''}`} onClick={() => setOption(card.value)}>
                                        {card.icon}
                                        <p>{card.label}</p>
                                    </div>
                                ))}
                            </div>
                            <button onClick={handlePreviousStep} className="prev-button"><FaArrowLeft /></button>
                            <button onClick={handleNextStep} className="next-button" disabled={!option}><FaArrowRight /></button>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="step">
                            <p>¡Ya casi terminamos, {name}! 😊
                                Describe en detalle qué solución digital necesitas.</p>
                            <textarea placeholder="Describe tu proyecto" value={description} onChange={(e) => setDescription(e.target.value)} required />
                            <button onClick={handlePreviousStep} className="prev-button"><FaArrowLeft /></button>
                            <button onClick={handleNextStep} className="next-button" disabled={!description}><FaArrowRight /></button>
                        </div>
                    )}
                    {step === 4 && (
                        <div className="step">
                            <p>¡Perfecto, {name}! 😃 Nuestro equipo se pondrá en contacto contigo pronto.</p>
                            <button onClick={handlePreviousStep} className="prev-button"><FaArrowLeft /></button>
                            <button type="submit" className="next-button">Enviar por WhatsApp</button>
                        </div>
                    )}
                </form>
            </Modal>
        </div>
    );
};

export default StepForModal;
