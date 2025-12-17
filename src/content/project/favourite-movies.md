---
titulo: "FavouriteMovies"
fechaInicio: "2023-09"
fechaFin: "2023-12"
skills: ["Kotlin", "Android SDK", "Coroutines", "Room DB", "REST API", "MVVM"]

imagen: "/projects/favouriteMovies.jpg"
descripcion: "A native Android application designed to discover and curate personal movie collections, showcasing modern Kotlin development patterns including asynchronous flows and local data persistence."
---

Developed in parallel with [**MoneyGuardian**](/projects/moneyguardian), this project served as a specialized exploration into the modern **Kotlin** ecosystem for Android development. Unlike the Java-based counterpart, FavouriteMovies leverages the expressive power of Kotlin to build a seamless movie discovery platform integrated with the **IMDB API**.

The application was architected using **MVVM (Model-View-ViewModel)** principles to ensure a clean separation of concerns and testability. Key technical implementations include:

*   **Asynchronous Concurrency**: Extensive use of **Kotlin Coroutines** and **Flow** to handle network requests and database operations off the main thread, ensuring a stutter-free user interface.
*   **Network Layer**: A robust client implementation for consuming RESTful endpoints from IMDB, handling JSON parsing and error management gracefully.
*   **Local Persistence**: Integration of a local database to cache user preferences and movie details, providing a resilient offline-first experience.

This project reinforces the ability to adapt to evolving mobile standards, shifting from imperative Java paradigms to the reactive, functional approach of modern Kotlin.
