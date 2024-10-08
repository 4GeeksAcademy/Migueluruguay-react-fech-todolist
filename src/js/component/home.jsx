import React, { useState, useEffect } from "react";

const Home = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");

    // URL base de la API
    const API_URL = 'https://playground.4geeks.com/todo/user/alesanchezr';

    // useEffect para obtener tareas de la API al cargar
    useEffect(() => {
        fetch(API_URL)
            .then((resp) => resp.json())
            .then((data) => {
                setTasks(data);
            })
            .catch((error) => console.log("Error loading tasks", error));
    }, []);

    // Función para actualizar las tareas en la API
    const updateTasksOnServer = (newTasks) => {
        fetch(API_URL, {
            method: "PUT",
            body: JSON.stringify(newTasks),
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((resp) => {
            if (resp.ok) {
                console.log("Tasks updated successfully");
            }
            return resp.json();
        })
        .catch((error) => console.log("Error updating tasks", error));
    };

    // Función para agregar una nueva tarea
    const addTask = (e) => {
        if (e.key === "Enter" && newTask.trim() !== "") {
            const updatedTasks = [...tasks, { label: newTask, done: false }];
            setTasks(updatedTasks);
            updateTasksOnServer(updatedTasks);
            setNewTask("");
        }
    };

    // Función para eliminar una tarea
    const deleteTask = (index) => {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
        updateTasksOnServer(updatedTasks);
    };

    // Función para limpiar todas las tareas
    const clearTasks = () => {
        setTasks([]);
        updateTasksOnServer([]);
    };

    return (
        <div className="text-center mt-5">
            <h1 className="mb-4">Lista de Tareas</h1>
            <input
                type="text"
                placeholder="What needs to be done?"
                className="form-control"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={addTask}
                aria-label="New task input"
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
                                aria-label={`Delete task: ${task.label}`}
                            >
                                X
                            </button>
                        </li>
                    ))
                )}
            </ul>
            <p className="mt-3">{tasks.length} item{tasks.length !== 1 ? "s" : ""} left</p>
            <button className="btn btn-danger mt-3" onClick={clearTasks} aria-label="Clear all tasks">
                Clear all tasks
            </button>
        </div>
    );
};

export default Home;
