import React, { useState } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";

interface ContactSectionProps {
  githubUrl: string;
  linkedinUrl: string;
}

const ContactSection: React.FC<ContactSectionProps> = ({
  githubUrl,
  linkedinUrl,
}) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    emailjs
      .send(
        "default_service",
        "template_ssskapj",
        {
          from_name: form.name,
          from_email: form.email,
          message: form.message,
        },
        { publicKey: "mOFa4LUBphaGefNlQ" }
      )
      .then(() => setStatus("sent"))
      .catch(() => setStatus("error"));
  };

  return (
    <section
      id="contact"
      className="tw-w-full tw-py-20 tw-flex tw-flex-col tw-items-center tw-text-white"
    >
      {/* TÍTULO */}
      <div className="tw-mb-12 tw-text-center">
        <h2 className="tw-text-4xl tw-font-bold">Contact</h2>
      </div>

      {/* COLUMNAS */}
      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-12 tw-max-w-5xl tw-w-full tw-px-6">

        {/* COLUMNA IZQUIERDA: ICONOS REDES CON TEXTO */}
        <div className="tw-flex tw-flex-col tw-gap-8 tw-items-start tw-justify-center">

          {/* GitHub */}
          <motion.a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            className="tw-flex tw-items-center tw-gap-4"
          >
            <img
              src="/logos/github.svg"
              alt="GitHub"
              className="tw-w-[4em] tw-h-[4em]"
            />
            <div className="tw-flex tw-flex-col">
              <span className="tw-font-semibold tw-text-lg">GitHub</span>
              <span className="tw-text-sm">Check out my projects and code</span>
            </div>
          </motion.a>

          {/* LinkedIn */}
          <motion.a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            className="tw-flex tw-items-center tw-gap-4"
          >
            <img
              src="/logos/linkedin.svg"
              alt="LinkedIn"
              className="tw-w-[4em] tw-h-[4em]"
            />
            <div className="tw-flex tw-flex-col">
              <span className="tw-font-semibold tw-text-lg">LinkedIn</span>
              <span className="tw-text-sm">Connect and see my professional experience</span>
            </div>
          </motion.a>
        </div>

        {/* COLUMNA DERECHA: FORMULARIO */}
        <form
          onSubmit={handleSubmit}
          className="tw-flex tw-flex-col tw-gap-4 tw-w-full tw-bg-black/30 tw-p-8 tw-rounded-2xl tw-backdrop-blur-sm tw-shadow-lg"
        >
          <h3 className="tw-text-2xl tw-font-semibold">Get in touch</h3>

          <input
            type="text"
            placeholder="Your name"
            required
            className="tw-p-3 tw-rounded-lg tw-bg-neutral-800/70 tw-text-white"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="email"
            placeholder="Your email"
            required
            className="tw-p-3 tw-rounded-lg tw-bg-neutral-800/70 tw-text-white"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <textarea
            placeholder="Your message"
            required
            className="tw-p-3 tw-rounded-lg tw-bg-neutral-800/70 tw-text-white tw-h-32"
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />

          <button
            type="submit"
            disabled={status === "loading"}
            className="tw-bg-[#5227FF] hover:tw-bg-[#6a44ff] tw-text-white tw-font-medium tw-rounded-lg tw-py-3 tw-transition"
          >
            {status === "loading"
              ? "Sending..."
              : status === "sent"
                ? "Email sent!"
                : "Send message"}
          </button>

          {status === "error" && (
            <p className="tw-text-red-400 tw-text-sm tw-mt-2">
              An error occurred while sending the message.
            </p>
          )}
        </form>
        <script type="text/javascript">
          emailjs.init('mOFa4LUBphaGefNlQ')
        </script>
      </div>
    </section>
  );
};

export default ContactSection;
