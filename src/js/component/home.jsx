import React, { useState, useEffect } from "react";

const Home = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState(""); // Mensaje para accesibilidad

    // URL base de la API
    const API_URL = 'https://playground.4geeks.com/todo';

    // useEffect para verificar si hay un usuario y cargarlo
    useEffect(() => {
        const username = prompt("Por favor, introduce tu nombre de usuario:");
        if (username) {
            fetch(`${API_URL}/users/${username}`)
                .then((resp) => {
                    if (resp.status === 404) {
                        setMessage("No se encontró el usuario. Creando uno nuevo...");
                        createUser(username); // Si no hay usuario, se crea uno nuevo
                    } else {
                        return resp.json();
                    }
                })
                .then((data) => {
                    if (data) {
                        setUser(data); // Guardamos el usuario
                        fetchTasks(data.name); // Cargar las tareas del usuario
                    }
                })
                .catch((error) => setMessage("Error al cargar el usuario"));
        }
    }, []);

    // Función para crear un nuevo usuario si no existe
    const createUser = (username) => {
        fetch(`${API_URL}/users/${username}`, {
            method: "POST",
            body: JSON.stringify({ name: username }),
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((resp) => {
            if (resp.ok) {
                setMessage("Usuario creado con éxito");
                return resp.json();
            }
        })
        .then((data) => {
            if (data) {
                setUser(data); // Guardar el usuario recién creado
            }
        })
        .catch((error) => setMessage("Error al crear el usuario"));
    };

    // Función para obtener las tareas del usuario
    const fetchTasks = (username) => {
        fetch(`${API_URL}/users/${username}`)
            .then((resp) => resp.json())
            .then((data) => {
                if (data && data.todos) {
                    setTasks(data.todos); // Guardar las tareas en el estado
                }
            })
            .catch((error) => setMessage("Error al cargar las tareas"));
    };

    // Función para agregar una nueva tarea
    const addTask = (e) => {
        if (e.key === "Enter" && newTask.trim() !== "" && user) {
            const newTaskData = { label: newTask, is_done: false };
            setTasks([...tasks, newTaskData]); // Actualizar la lista de tareas localmente
            updateTasksOnServer([...tasks, newTaskData]); // Actualizar las tareas en el servidor
            setNewTask(""); // Limpiar el input
        } else if (!user) {
            setMessage("No hay un usuario disponible. No se puede agregar la tarea.");
        }
    };

    // Función para actualizar las tareas en el servidor
    const updateTasksOnServer = (updatedTasks) => {
        if (user) {
            fetch(`${API_URL}/todos/${user.name}`, {
                method: "POST",
                body: JSON.stringify(updatedTasks.map(task => ({
                    label: task.label,
                    is_done: task.is_done || false
                }))),
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then((resp) => {
                if (resp.ok) {
                    setMessage("Tareas actualizadas con éxito");
                }
                return resp.json();
            })
            .catch((error) => setMessage("Error al actualizar las tareas"));
        } else {
            setMessage("No hay un usuario disponible. No se pueden actualizar las tareas.");
        }
    };

    // Función para eliminar una tarea
    const deleteTask = (index) => {
        if (user) {
            const taskToDelete = tasks[index];
            const updatedTasks = tasks.filter((_, i) => i !== index);
            setTasks(updatedTasks);
            updateTasksOnServer(updatedTasks); // Actualizar tareas tras eliminar una
            setMessage(`Tarea '${taskToDelete.label}' eliminada con éxito.`);
        } else {
            setMessage("No hay un usuario disponible. No se puede eliminar la tarea.");
        }
    };

    // Función para limpiar todas las tareas
    const clearTasks = () => {
        if (user) {
            setTasks([]);
            updateTasksOnServer([]); // Limpiar todas las tareas en el servidor
            setMessage("Todas las tareas han sido eliminadas.");
        } else {
            setMessage("No hay un usuario disponible. No se pueden limpiar las tareas.");
        }
    };

    return (
        <div className="text-center mt-5">
            <h1 className="mb-4">Lista de Tareas</h1>
            {/* Mensaje accesible para NVDA */}
            <div aria-live="assertive" className="sr-only">
                {message}
            </div>
            {!user && <p>Por favor, crea un usuario para gestionar las tareas.</p>}
            <input
                type="text"
                placeholder="¿Qué hay que hacer?"
                className="form-control"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={addTask}
                aria-label="Entrada de nueva tarea"
                disabled={!user}
            />
            <ul className="list-group mt-3">
                {tasks.length === 0 ? (
                    <li className="list-group-item text-muted">
                        No hay tareas, añadir tareas
                    </li>
                ) : (
                    tasks.map((task, index) => (
                        <li
                            key={index}
                            className="list-group-item d-flex justify-content-between align-items-center"
                        >
                            {task.label}
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => deleteTask(index)}
                                aria-label={`Eliminar tarea: ${task.label}`}
                            >
                                X
                            </button>
                        </li>
                    ))
                )}
            </ul>
            <p className="mt-3">{tasks.length} tarea{tasks.length !== 1 ? "s" : ""} pendiente{tasks.length !== 1 ? "s" : ""}</p>
            <button className="btn btn-danger mt-3" onClick={clearTasks} aria-label="Limpiar todas las tareas">
                Limpiar todas las tareas
            </button>
        </div>
    );
};

export default Home;
