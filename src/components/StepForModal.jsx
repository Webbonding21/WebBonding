import React, { useState, useRef } from "react";
import Modal from "react-modal";
import { 
  FaArrowRight, FaArrowLeft, FaTimes, 
  FaGlobe, FaMobileAlt, FaShoppingCart, FaLightbulb, 
  FaLaptopCode, FaDesktop, FaServer, FaShapes 
} from "react-icons/fa";
import "../assets/StepForModal.css";

// Asegura que el modal se ate al root de tu app
Modal.setAppElement('#root');

const StepForModal = ({ label = "Iniciar proyecto", className = "" }) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    
    // Estados del formulario
    const [name, setName] = useState("");
    const [correo, setCorreo] = useState("");
    const [description, setDescription] = useState("");
    const [option, setOption] = useState("");
    const [errors, setErrors] = useState({ name: "", correo: "" });
    
    const form = useRef();

    const openModal = () => setModalIsOpen(true);
    
    const closeModal = () => {
        setModalIsOpen(false);
        // Resetear formulario al cerrar (opcional, pero recomendado)
        setTimeout(() => {
            setStep(1);
            setName("");
            setCorreo("");
            setDescription("");
            setOption("");
            setErrors({ name: "", correo: "" });
        }, 300);
    };

    // Validaciones
    const validateName = (value) => {
        const nameRegex = /^[a-zA-ZÀ-ÿ\s]{3,40}$/;
        if (!nameRegex.test(value)) {
            setErrors((prev) => ({ ...prev, name: "Mínimo 3 letras, sin números." }));
        } else {
            setErrors((prev) => ({ ...prev, name: "" }));
        }
        setName(value);
    };

    const validateCorreo = (value) => {
        const correoRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!correoRegex.test(value)) {
            setErrors((prev) => ({ ...prev, correo: "Correo inválido." }));
        } else {
            setErrors((prev) => ({ ...prev, correo: "" }));
        }
        setCorreo(value);
    };

    // Navegación
    const handleNextStep = () => {
        if (step === 1 && name && correo && !errors.name && !errors.correo) setStep(step + 1);
        else if (step === 2 && option) setStep(step + 1);
        else if (step === 3 && description) setStep(step + 1);
    };

    const handlePreviousStep = () => setStep(step - 1);

    // Enviar a WhatsApp
    const handleSubmit = (e) => {
        e.preventDefault();
        const message = `🚀 *Nueva Solicitud Web Bonding* 🚀\n\n👤 *Nombre:* ${name}\n📧 *Correo:* ${correo}\n💡 *Servicio:* ${option}\n📝 *Detalles:* ${description}\n\n¡Estoy listo para comenzar!`;
        const whatsappUrl = `https://wa.me/584220579731?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
        closeModal();
    };

    const optionCards = [
        { value: "Sitio Web", label: "Web", icon: <FaGlobe /> },
        { value: "E-commerce", label: "Tienda", icon: <FaShoppingCart /> },
        { value: "App Móvil", label: "App Móvil", icon: <FaMobileAlt /> },
        { value: "Sistema administrativo", label: "Sistema", icon: <FaLaptopCode /> },
        { value: "App de escritorio", label: "Escritorio", icon: <FaDesktop /> },
        { value: "Conectar sistemas (API)", label: "Integraciones", icon: <FaServer /> },
        { value: "Asesoría", label: "Asesoría", icon: <FaLightbulb /> },
        { value: "Otro", label: "Otro", icon: <FaShapes /> }
    ];

    return (
        <div>
            {/* Botón Principal (Trigger) */}
            <button onClick={openModal} className={`open-modal-button ${className}`.trim()}>
                {label}
            </button>

            <Modal 
                isOpen={modalIsOpen} 
                onRequestClose={closeModal} 
                className="modal-content" 
                overlayClassName="modal-overlay"
                closeTimeoutMS={300} // Para animación de salida
            >
                <button className="close-icon" onClick={closeModal}><FaTimes /></button>
                
                {/* Barra de Progreso */}
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${(step / 4) * 100}%` }}></div>
                </div>

                <form ref={form} onSubmit={handleSubmit} className="modal-form">
                    
                    {/* PASO 1: DATOS */}
                    {step === 1 && (
                        <div className="step-container fade-in">
                            <h3>👋 ¡Hola! Conozcámonos.</h3>
                            <p className="step-desc">Para empezar, dinos quién eres.</p>
                            
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="Tu Nombre Completo"
                                    value={name}
                                    onChange={(e) => validateName(e.target.value)}
                                    className={errors.name ? "input-error" : ""}
                                />
                                {errors.name && <span className="error-text">{errors.name}</span>}
                            </div>

                            <div className="input-group">
                                <input
                                    type="email"
                                    placeholder="Tu Correo Electrónico"
                                    value={correo}
                                    onChange={(e) => validateCorreo(e.target.value)}
                                    className={errors.correo ? "input-error" : ""}
                                />
                                {errors.correo && <span className="error-text">{errors.correo}</span>}
                            </div>

                            <div className="modal-actions right">
                                <button type="button" onClick={handleNextStep} className="nav-btn primary" disabled={!name || !correo || errors.name || errors.correo}>
                                    Siguiente <FaArrowRight />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PASO 2: SELECCIÓN */}
                    {step === 2 && (
                        <div className="step-container fade-in">
                            <h3>🚀 ¿Qué estás buscando?</h3>
                            <p className="step-desc">Elige la categoría que mejor se adapte.</p>
                            
                            <div className="options-grid">
                                {optionCards.map((card) => (
                                    <div 
                                        key={card.value} 
                                        className={`option-card ${option === card.value ? 'selected' : ''}`} 
                                        onClick={() => setOption(card.value)}
                                    >
                                        <div className="card-icon">{card.icon}</div>
                                        <span>{card.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={handlePreviousStep} className="nav-btn secondary"><FaArrowLeft /></button>
                                <button type="button" onClick={handleNextStep} className="nav-btn primary" disabled={!option}><FaArrowRight /></button>
                            </div>
                        </div>
                    )}

                    {/* PASO 3: DETALLES */}
                    {step === 3 && (
                        <div className="step-container fade-in">
                            <h3>📝 Cuéntanos más</h3>
                            <p className="step-desc">Describe tu idea, funcionalidades clave o referencias.</p>
                            
                            <textarea 
                                placeholder="Ej: Necesito una app de delivery para mi restaurante con pagos en línea..." 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                required 
                            />

                            <div className="modal-actions">
                                <button type="button" onClick={handlePreviousStep} className="nav-btn secondary"><FaArrowLeft /></button>
                                <button type="button" onClick={handleNextStep} className="nav-btn primary" disabled={!description}><FaArrowRight /></button>
                            </div>
                        </div>
                    )}

                    {/* PASO 4: CONFIRMACIÓN */}
                    {step === 4 && (
                        <div className="step-container fade-in text-center">
                            <h3>🎉 ¡Todo listo, {name.split(' ')[0]}!</h3>
                            <p className="step-desc">Al hacer clic en enviar, te redirigiremos a WhatsApp para finalizar la cotización con nuestro equipo.</p>
                            
                            <div className="modal-actions center">
                                <button type="button" onClick={handlePreviousStep} className="nav-btn secondary"><FaArrowLeft /></button>
                                <button type="submit" className="nav-btn success">Enviar Solicitud <FaArrowRight /></button>
                            </div>
                        </div>
                    )}
                </form>
            </Modal>
        </div>
    );
};

export default StepForModal;