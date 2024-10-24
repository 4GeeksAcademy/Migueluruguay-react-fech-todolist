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
            updateTasksOnServer({label:newTask, is_done: false}); // Actualizar las tareas en el servidor
            setNewTask(""); // Limpiar el input
        } else if (!user) {
            setMessage("No hay un usuario disponible. No se puede agregar la tarea.");
        }
    };

    // Función para actualizar las tareas en el servidor
    const updateTasksOnServer = (task) => {
        if (user) {
            fetch(`${API_URL}/todos/${user.name}`, {
                method: "POST",
                body: JSON.stringify(task),
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then((resp) => {
                if (resp.ok) {
                    setMessage("Tareas actualizadas con éxito");
                    fetchTasks(user.name);
                }
                return resp.json();
            })
            .catch((error) => setMessage("Error al actualizar las tareas"));
        } else {
            setMessage("No hay un usuario disponible. No se pueden actualizar las tareas.");
        }
    };

    // Función para eliminar una tarea
    const deleteTask = (id) => {
        if (user) {
            fetch(`${API_URL}/todos/${id}`, {
                method:"DELETE", 
                headers:{"Content-Type":"application/json"}
            }).then((resp)=>{
                if(resp.status==204){
                    setMessage("tarea eliminada con éxito");
                fetchTasks(user.name)   
                }
            })
        } else {
            setMessage("No hay un usuario disponible. No se puede eliminar la tarea.");
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
                                onClick={() => deleteTask(task.id)}
                                aria-label={`Eliminar tarea: ${task.label}`}
                            >
                                X
                            </button>
                        </li>
                    ))
                )}
            </ul>
            

        </div>
    );
};

export default Home;
