// src/app/ui/common/FAQAccordion.tsx (CÓDIGO FINAL Nivel PRO - Contenido Simple y Directo)

import { Accordion, AccordionItem, AccordionItemButton, AccordionItemHeading, AccordionItemPanel } from "react-accessible-accordion";

// Este componente utiliza el CSS definido en src/app/ayuda/accordion.css
export default function FAQAccordion() {

    return (
        <Accordion allowZeroExpanded>
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        ¿Cómo funciona el servicio de Recargas Telefónicas?
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    <p>
                    Realiza recargas de saldo para cualquier operador de telefonía móvil en **Colombia, Venezuela, Ecuador, Perú y Chile**. La recarga es **instantánea**, fácil y completamente segura.
                    </p>
                </AccordionItemPanel>
            </AccordionItem>
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        ¿Cómo me registro para obtener los servicios?
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    <p>
                    El registro es rápido y se hace directamente en nuestra plataforma. Una vez creada tu cuenta, obtienes un panel personalizado para gestionar tus operaciones digitales de forma sencilla.
                    </p>
                </AccordionItemPanel>
            </AccordionItem>
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        ¿Qué métodos de pago aceptan?
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    <p>
                    Aceptamos métodos de pago flexibles y seguros: **tarjetas de crédito/débito**, transferencias bancarias, pagos en línea, **Zelle** y plataformas cripto como **Binance**.
                    </p>
                </AccordionItemPanel>
            </AccordionItem>
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        ¿Puedo realizar recargas o pagos para otros países?
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    <p>
                    Nuestras recargas están disponibles para operadores en **Venezuela, Colombia, Ecuador, Perú y Chile**. Constantemente estamos trabajando para ampliar nuestros servicios a más países.
                    </p>
                </AccordionItemPanel>
            </AccordionItem>
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        ¿Ofrecen soporte al cliente?
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    <p>
                    Sí. Ofrecemos **soporte al cliente 24 horas al día, los 7 días de la semana**, para ayudarte de inmediato con cualquier pregunta o problema que puedas tener con nuestros servicios.
                    </p>
                </AccordionItemPanel>
            </AccordionItem>
        </Accordion>
    )
}