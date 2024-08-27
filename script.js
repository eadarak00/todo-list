// Sélection des éléments du DOM nécessaires
let form = document.querySelector("#task-form");
let filterCompleted = document.getElementById('filter-completed');
let filterActive = document.getElementById('filter-active');
let filterBtn = document.getElementsByClassName('filter-btn');
let filterAll = document.getElementById('filter-all');

// Chargement des tâches depuis le localStorage
let tasks = loadTasks();

// Initialisation de l'ID des tâches
let taskId = 0;

/**
 * Fonction déclenchée lors de la soumission du formulaire.
 * Crée une nouvelle tâche et l'ajoute à la liste des tâches.
 */
function onSubmit(event) {
    event.preventDefault();
    let taskInput = event.target["task_input"].value;

    if (taskInput) {
        let newTask = {
            id: taskId, // ID auto-incrémenté
            text: taskInput.trim(),
            completed: false
        };
        tasks.push(newTask);
        createTask(newTask);
        saveTasks(tasks);
        taskId++; // Incrémentation de l'ID pour la prochaine tâche
        event.target.reset(); // Réinitialisation du formulaire
    }
}

/**
 * Crée une nouvelle ligne dans le tableau des tâches et l'ajoute au DOM.
 */
function createTask(task) {
    let row = document.createElement("tr");
    row.classList.add("task-row");

    row.appendChild(createCellTask(task)); // Création de la cellule contenant la tâche
    row.appendChild(createCellIcon("fa-pen-to-square", "edit-icon", updateTask)); // Ajout de l'icône de modification
    row.appendChild(createCellIcon("fa-trash", "remove-icon", deleteTask)); // Ajout de l'icône de suppression

    let tableBody = document.getElementById("table-body");
    tableBody.appendChild(row);
}

/**
 * Crée une cellule contenant la tâche (texte et case à cocher).
 */
function createCellTask(task) {
    let cellTask = document.createElement("td");
    cellTask.classList.add("task-cell");

    let input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    input.classList.add("task-checkbox");
    input.checked = task.completed;
    input.addEventListener('change', (e) => {
        task.completed = e.target.checked;
        saveTasks(tasks); // Sauvegarde des modifications
    });

    let label = document.createElement("label");
    label.setAttribute("data-id", task.id); // Association de l'ID à la tâche
    label.appendChild(input);
    label.appendChild(document.createTextNode(task.text));
    cellTask.appendChild(label);

    return cellTask;
}

/**
 * Crée une cellule contenant une icône (pour modifier ou supprimer la tâche).
 */
function createCellIcon(icone, additionalClass, event) {
    let cellIcon = document.createElement("td");
    cellIcon.classList.add("icon-cell");
    let btn = document.createElement("button");

    let icon = document.createElement("i");
    icon.classList.add("fas", icone);
    if (additionalClass) {
        btn.classList.add(`btn-${additionalClass}`);
        icon.classList.add(additionalClass);
    }

    btn.appendChild(icon);

    if (additionalClass === "edit-icon") {
        btn.classList.add("btn");
        btn.setAttribute("type", "button");
        btn.setAttribute("data-bs-toggle", "modal");
        btn.setAttribute("data-bs-target", "#updateModal");
    }
    if (event) {
        btn.addEventListener("click", event); // Ajout de l'événement approprié
    }

    cellIcon.appendChild(btn);
    return cellIcon;
}

/**
 * Sauvegarde les tâches dans le localStorage.
 */
function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

/**
 * Charge les tâches depuis le localStorage.
 */
function loadTasks() {
    const tasks = localStorage.getItem("tasks");
    return tasks ? JSON.parse(tasks) : []; // Retourne un tableau vide si aucune tâche n'est trouvée
}

/**
 * Crée le tableau des tâches à partir des données stockées.
 */
function createTasksTable() {
    let tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";

    tasks.forEach((task) => {
        createTask(task); // Ajoute chaque tâche au tableau
    });
}

/**
 * Supprime une tâche du tableau et du localStorage.
 */
function deleteTask(event) {
    let row = event.target.closest("tr");
    let taskId = parseInt(row.querySelector("label").getAttribute("data-id"), 10);

    let resp = confirm("Voulez-vous supprimer cette tâche ?");
    if (resp) {
        // Supprime la tâche du tableau `tasks`
        tasks = tasks.filter((task) => task.id !== taskId);
        
        // Met à jour le localStorage après la suppression
        saveTasks(tasks);

        // Supprime la ligne correspondante dans le DOM
        row.remove();
    }
}

/**
 * Met à jour le texte d'une tâche existante.
 */
function updateTask(event) {
    event.preventDefault();
    let row = event.target.closest("tr");
    let label = row.querySelector("label");
    let taskId = label.getAttribute("data-id");
    let taskText = label.textContent.trim();

    let modalInput = document.getElementById('modal-input');
    modalInput.value = taskText;

    let formUpdate = document.querySelector("#modal-form");
    formUpdate.onsubmit = function(e) {
        e.preventDefault();
        let updatedTask = modalInput.value.trim();

        if (updatedTask && updatedTask !== taskText) {
            let taskIndex = tasks.findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
                tasks[taskIndex].text = updatedTask;
                saveTasks(tasks); // Sauvegarde des modifications
            }

            label.childNodes[1].textContent = updatedTask;

            let modalElement = document.querySelector("#updateModal");
            let modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide(); // Ferme la fenêtre modale après mise à jour
        }
    };
}

/**
 * Affiche uniquement les tâches complétées.
 */
function displayCompletedTasks(e) {
    e.preventDefault();
    activateFilterButton(filterCompleted);

    let tableBody = document.getElementById("table-body");
    tableBody.innerHTML = '';

    tasks.filter(task => task.completed).forEach(createTask); // Filtre et affiche les tâches complétées
}

/**
 * Affiche uniquement les tâches actives (non complétées).
 */
function displayActiveTasks(e) {
    e.preventDefault();
    activateFilterButton(filterActive);

    let tableBody = document.getElementById("table-body");
    tableBody.innerHTML = '';

    tasks.filter(task => !task.completed).forEach(createTask); // Filtre et affiche les tâches actives
}

/**
 * Affiche toutes les tâches.
 */
function displayAllTasks(e) {
    e.preventDefault();
    activateFilterButton(filterAll);
    createTasksTable(); // Affiche toutes les tâches
}

/**
 * Active le bouton de filtrage sélectionné et désactive les autres.
 */
function activateFilterButton(activeButton) {
    for (btn of filterBtn) {
        btn.classList.remove('active');
    }
    activeButton.classList.add('active'); // Active le bouton cliqué
}

// Ajout des événements pour le formulaire et les filtres
form.addEventListener("submit", onSubmit);
filterCompleted.addEventListener('click', displayCompletedTasks);
filterActive.addEventListener('click', displayActiveTasks);
filterAll.addEventListener('click', displayAllTasks);

// Génère le tableau des tâches lors du chargement de la page
document.addEventListener("DOMContentLoaded", createTasksTable);
