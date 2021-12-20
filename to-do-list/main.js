'use strict';

let api_key = '50d2199a-42dc-447d-81ed-d68a443b697e';
let mainUrl = new URL('http://tasks-api.std-900.ist.mospolytech.ru/');

async function getTasks() {
    let url = new URL('api/tasks', mainUrl);
    url.searchParams.set('api_key', api_key);

    let response = await fetch(url);

    let json = await response.json();
    if (json.error) {
        showAlert(json.error);
    }
    else {
      return json;
    }

}
function renderTaskElement(elem) {
    
    let newTaskElement = document.getElementById('task-template').cloneNode(true);
    newTaskElement.id = elem.id;
    newTaskElement.querySelector('.task-name').innerHTML = elem.name;
    newTaskElement.querySelector('.task-description').innerHTML = elem.desc;
    newTaskElement.classList.remove('d-none');
    for (let btn of newTaskElement.querySelectorAll('.move-btn')) {
        btn.onclick = moveBtnHandler;
    }


    return newTaskElement
}
function parseJSON(json) {
    
    for (let elem of json.tasks) {
        let listElement = document.getElementById(`${elem.status}-list`);
        listElement.append(renderTaskElement(elem));
        
        let tasksCounterElement = listElement.closest('.card').querySelector('.tasks-counter');
        tasksCounterElement.innerHTML = Number(tasksCounterElement.innerHTML) + 1;
    }
}


function showAlert(msg, category='alert-danger') {
    let alertsContainer = document.querySelector('.alerts');
    let newAlertElement = document.getElementById('alerts-template').cloneNode(true);
    if (msg == undefined) {
        return;
    }
    newAlertElement.querySelector('.msg').innerHTML = msg;
    newAlertElement.classList.add(category);
    newAlertElement.classList.remove('d-none');
    alertsContainer.append(newAlertElement);
}

function createTaskElement(form) {
    let newTaskElement = document.getElementById('task-template').cloneNode(true);
    newTaskElement.id = form.elements['task-id'].value;
    newTaskElement.querySelector('.task-name').innerHTML = form.elements['name'].value;
    newTaskElement.querySelector('.task-description').innerHTML = form.elements['description'].value;
    newTaskElement.classList.remove('d-none');
    for (let btn of newTaskElement.querySelectorAll('.move-btn')) {
        btn.onclick = moveBtnHandler;
    }
    return newTaskElement
}

function updateTask(form) {
    let taskElement = document.getElementById(form.elements['task-id'].value);
    taskElement.querySelector('.task-name').innerHTML = form.elements['name'].value;
    taskElement.querySelector('.task-description').innerHTML = form.elements['description'].value;
}


async function createTaskRequest(form) {
    let data = new FormData(form);
    data.set('status', form.elements['column'].value);
    data.set('desc', form.elements['description'].value);
    let url = new URL('api/tasks', mainUrl);
    url.searchParams.set('api_key', api_key);
    let response = await fetch(url, {
        method: 'POST',
        body: data
      });
    let result = await response.json();

    
    if (result.error) {
        return Promise.reject;
    }   
    return result;
}

async function updateTaskRequest(data) {
    let url = new URL(`api/tasks/${data.get('id')}`, mainUrl);
    url.searchParams.set('api_key', api_key);
   
    let response = await fetch(url, {
        method: 'PUT',
        body: data
      });
    
    let result = await response.json();

    
    if (result.error) {
        return Promise.reject;
    }   
}
function actionTaskBtnHandler(event) {
    let form, listElement, tasksCounterElement, alertMsg, action;
    form = event.target.closest('.modal').querySelector('form');
    action = form.elements['action'].value;

    if (action == 'create') {
        
        createTaskRequest(form)
            .then(function(result) {
                form.elements['task-id'].value = result.id;
                listElement = document.getElementById(`${form.elements['column'].value}-list`);
                listElement.append(createTaskElement(form));
                alertMsg = `Задача ${form.elements['name'].value} была успешно создана!`;
                showAlert(alertMsg, 'alert-success');
            })
            .catch(showAlert());

    } else if (action == 'edit') {
        
        let data = new FormData();
        data.set('desc', form.elements['description'].value);
        data.set('name', form.elements['name'].value);
        data.set('status', form.elements['column'].value);
        data.set('id', form.elements['task-id'].value);
        updateTaskRequest(data)
            .then(function() {
                updateTask(form);
                alertMsg = `Задача ${form.elements['name'].value} была успешно обновлена!`;
                showAlert(alertMsg, 'alert-success');
            })
            .catch(showAlert);
    }

}

function resetForm(form) {
    form.reset();
    form.querySelector('select').closest('.mb-3').classList.remove('d-none');
    form.elements['name'].classList.remove('form-control-plaintext');
    form.elements['description'].classList.remove('form-control-plaintext');
}

function setFormValues(form, taskId) {
    let taskElement = document.getElementById(taskId);
    form.elements['name'].value = taskElement.querySelector('.task-name').innerHTML;
    form.elements['description'].value = taskElement.querySelector('.task-description').innerHTML;
    form.elements['task-id'].value = taskId;
}

function prepareModalContent(event) {
    let form = event.target.querySelector('form');
    resetForm(form);

    let action = event.relatedTarget.dataset.action || 'create';

    form.elements['action'].value = action;
    event.target.querySelector('.modal-title').innerHTML = titles[action];
    event.target.querySelector('.action-task-btn').innerHTML = actionBtnText[action];

    if (action == 'show' || action == 'edit') {
        setFormValues(form, event.relatedTarget.closest('.task').id);
        event.target.querySelector('select').closest('.mb-3').classList.add('d-none');
    }

    if (action == 'show') {
        form.elements['name'].classList.add('form-control-plaintext');
        form.elements['description'].classList.add('form-control-plaintext');
    }

}


async function removeRequest(taskId) {
    let url = new URL(`api/tasks/${taskId}`, mainUrl);
    url.searchParams.set('api_key', api_key);
    
    let response = await fetch(url, {
        method: 'DELETE',
      });
      
    let result = await response.json();

    if (result.error) {
        return Promise.reject;
    }
    
}

function removeTaskBtnHandler(event) {
    let form = event.target.closest('.modal').querySelector('form');
    let taskElement = document.getElementById(form.elements['task-id'].value);

    let tasksCounterElement = taskElement.closest('.card').querySelector('.tasks-counter');
    tasksCounterElement.innerHTML = Number(tasksCounterElement.innerHTML) - 1;

    
    removeRequest(taskElement.id)
        .catch(showAlert);

    taskElement.remove();
}

function moveBtnHandler(event) {
    let taskElement = event.target.closest('.task');
    let currentListElement = taskElement.closest('ul');
    let targetListElement = document.getElementById(currentListElement.id == 'to-do-list' ? 'done-list' : 'to-do-list');

    let tasksCounterElement = taskElement.closest('.card').querySelector('.tasks-counter');
    tasksCounterElement.innerHTML = Number(tasksCounterElement.innerHTML) - 1;

    targetListElement.append(taskElement);

    let data = new FormData();
    data.set('id', taskElement.id);
    data.set('status', String(targetListElement.id).substring(0, String(targetListElement.id).indexOf('-list')));
    console.log(data.get('id'), data.get('status'));
    updateTaskRequest(data)
        .catch(showAlert);

    tasksCounterElement = targetListElement.closest('.card').querySelector('.tasks-counter');
    tasksCounterElement.innerHTML = Number(tasksCounterElement.innerHTML) + 1;
}

let taskCounter = 0;

let titles = {
    'create': 'Создание новой задачи',
    'edit': 'Редактирование задачи',
    'show': 'Просмотр задачи'
}

let actionBtnText = {
    'create': 'Создать',
    'edit': 'Сохранить',
    'show': 'Ок'
}

window.onload = function () {
    getTasks()
        .then(parseJSON)
        .catch(showAlert);
    
    document.querySelector('.action-task-btn').onclick = actionTaskBtnHandler;

    document.getElementById('task-modal').addEventListener('show.bs.modal', prepareModalContent);

    document.getElementById('remove-task-modal').addEventListener('show.bs.modal', function (event) {
        let taskElement = event.relatedTarget.closest('.task');
        let form = event.target.querySelector('form');
        form.elements['task-id'].value = taskElement.id;
        event.target.querySelector('.task-name').innerHTML = taskElement.querySelector('.task-name').innerHTML;
    });
    document.querySelector('.remove-task-btn').onclick = removeTaskBtnHandler;

    
}