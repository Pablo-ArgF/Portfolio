---
titulo: "Tiko"
fechaInicio: "2025-12"
skills: ["System Design", "Spring Boot", "Kotlin Multiplatform", "RabbitMQ", "OCR/AI", "Grafana", "Prometheus", "Redis", "PostgreSQL"]
imagen: "/projects/tiko.png"
descripcion: "A next-generation smart economy platform currently in architectural definition. Designed to transform receipt data into actionable financial insights and crowd-sourced price intelligence using advanced AI pipelines."
---

Currently in the advanced **architectural definition phase**, Tiko is conceptualized as a cross-platform ecosystem (Web & Mobile) aimed at revolutionizing personal finance and retail analytics. The platform's core value proposition revolves around transforming unstructured purchase data (supermarket receipts) into a structured, queryable knowledge graph for expense tracking and intelligent price comparison.

The proposed architecture is robust and scalable, designed to handle high-throughput data ingestion:

*   **Cross-Platform Client**: Utilizing **Kotlin Multiplatform (KMP)** to deliver native performance across Android, iOS, and Web from a single codebase.
*   **Event-Driven Backend**: A **Spring Boot** microservices ecosystem orchestrated via **RabbitMQ** for asynchronous processing of receipt uploads, ensuring system responsiveness under load.
*   **AI Processing Pipeline**: A multi-stage ingestion engine where raw images are processed via **OCR**, followed by **Large Language Models (LLMs)** for entity extraction and categorization (product, store, price).
*   **Data Persistence & Intelligence**: 
    *   **PostgreSQL** as the relational backbone for transactional data.
    *   **Vector Databases** to enable semantic product matching, powering the recommendation engine that suggests cheaper alternatives across different retailers.
    *   **Redis** anticipated for high-speed caching of frequent queries.
*   **Observability First**: Integrated **Prometheus** and **Grafana** stack for real-time monitoring of system health and ingestion metrics.

This project represents a sophisticated exercise in distributed system design, focusing on data consistency, privacy, and scalable AI integration.
