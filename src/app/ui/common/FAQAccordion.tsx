import { Accordion, AccordionItem, AccordionItemButton, AccordionItemHeading, AccordionItemPanel } from "react-accessible-accordion";

// Este componente utiliza el CSS definido en src/app/ayuda/accordion.css
export default function FAQAccordion() {

    return (
        <Accordion allowZeroExpanded>
            
            {/* 1. SERVICIOS GENERALES (ECOSISTEMA) */}
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        ¿Qué servicios ofrece Moto Store LLC?
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    <p className="text-slate-600 leading-relaxed">
                        Somos una plataforma integral registrada en **USA, Colombia y Venezuela**. Ofrecemos: 
                        <br/>1. **Remesas y Cambios P2P** (Zelle, USDT, Pesos, Bolívares).
                        <br/>2. **Agencia Digital** (Desarrollo Web, Apps y Marketing).
                        <br/>3. **Entretenimiento** (Streaming Premium y Recargas).
                    </p>
                </AccordionItemPanel>
            </AccordionItem>

            {/* 2. REMESAS Y CAMBIOS (NUEVO FUERTE) */}
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        ¿Cómo funciona el servicio de Remesas y Cambios P2P?
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    <p className="text-slate-600 leading-relaxed">
                        Es un sistema seguro y rápido. Recibimos tu moneda (Dólares Zelle, USDT, Pesos Colombianos) y te entregamos la moneda que necesitas (Bolívares Pago Móvil, etc.) al instante. Usamos nuestra **Calculadora en tiempo real** para garantizarte la tasa exacta.
                    </p>
                </AccordionItemPanel>
            </AccordionItem>

            {/* 3. DESARROLLO WEB Y MARKETING (AGENCIA) */}
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        ¿Realizan Páginas Web y Marketing para empresas?
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    <p className="text-slate-600 leading-relaxed">
                        ¡Sí! Contamos con un equipo de desarrolladores y expertos en marketing. Diseñamos tu **Tienda Online, Página Corporativa o Aplicación Móvil**, y gestionamos tus campañas de publicidad en Redes Sociales para hacer crecer tu negocio.
                    </p>
                </AccordionItemPanel>
            </AccordionItem>

            {/* 4. MÉTODOS DE PAGO (LOCALIZADO) */}
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        ¿Qué métodos de pago aceptan?
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    <p className="text-slate-600 leading-relaxed">
                        Nos adaptamos a tu país. Aceptamos:
                        <br/>• **Venezuela:** Pago Móvil, Transferencia Bancaria.
                        <br/>• **Colombia:** Bancolombia, Nequi.
                        <br/>• **Internacional:** Zelle, Binance (USDT), Saldo PayPal.
                    </p>
                </AccordionItemPanel>
            </AccordionItem>

            {/* 5. SOPORTE Y SEGURIDAD */}
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        ¿Es seguro y ofrecen garantía?
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    <p className="text-slate-600 leading-relaxed">
                        Totalmente. Al ser una empresa legalmente constituida en 3 países, tus operaciones tienen respaldo. Además, ofrecemos **Soporte Humano 24/7** vía WhatsApp para resolver cualquier duda al momento.
                    </p>
                </AccordionItemPanel>
            </AccordionItem>
            
        </Accordion>
    )
}