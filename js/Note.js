class Note {
    constructor(title = '', description = '') {
        this.title = title;
        this.description = description;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    static createNotePanel(x, y, onSave, onCancel) {
        const panel = document.createElement('div');
        panel.className = 'note-panel';
        panel.style.position = 'absolute';
        panel.style.left = `${x}px`;
        panel.style.top = `${y}px`;
        panel.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        panel.style.border = '1px solid rgb(255, 255, 255)';
        panel.style.borderRadius = '10px';
        panel.style.padding = '15px';
        panel.style.boxShadow = '0 0 10px rgb(255, 255, 255)';
        panel.style.zIndex = '1000';

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.placeholder = 'Title';
        titleInput.style.width = '100%';
        titleInput.style.marginBottom = '10px';
        titleInput.style.padding = '5px';
        titleInput.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        titleInput.style.border = '1px solid rgb(255, 255, 255)';
        titleInput.style.borderRadius = '5px';
        titleInput.style.color = 'rgb(255, 255, 255)';

        const descriptionInput = document.createElement('textarea');
        descriptionInput.placeholder = 'Description';
        descriptionInput.style.width = '100%';
        descriptionInput.style.height = '100px';
        descriptionInput.style.marginBottom = '10px';
        descriptionInput.style.padding = '5px';
        descriptionInput.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        descriptionInput.style.border = '1px solid rgb(255, 255, 255)';
        descriptionInput.style.borderRadius = '5px';
        descriptionInput.style.color = 'rgb(255, 255, 255)';
        descriptionInput.style.resize = 'vertical';

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';

        const saveButton = document.createElement('button');
        saveButton.innerHTML = '✓';
        saveButton.style.width = '30px';
        saveButton.style.height = '30px';
        saveButton.style.borderRadius = '50%';
        saveButton.style.backgroundColor = '#4CAF50';
        saveButton.style.border = 'none';
        saveButton.style.color = 'white';
        saveButton.style.cursor = 'pointer';

        const cancelButton = document.createElement('button');
        cancelButton.innerHTML = '✕';
        cancelButton.style.width = '30px';
        cancelButton.style.height = '30px';
        cancelButton.style.borderRadius = '50%';
        cancelButton.style.backgroundColor = '#f44336';
        cancelButton.style.border = 'none';
        cancelButton.style.color = 'white';
        cancelButton.style.cursor = 'pointer';

        let isSaving = false; // Flag to prevent multiple saves

        saveButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (isSaving) return; // Prevent multiple saves
            isSaving = true;

            const note = new Note(titleInput.value, descriptionInput.value);
            
            // Remove panel before calling onSave to prevent any side effects
            const panelToRemove = panel;
            panel.remove();
            
            // Call onSave after panel is removed
            onSave(note);
        });

        cancelButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            panel.remove();
            onCancel();
        });

        // Prevent clicks inside panel from propagating
        panel.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        buttonContainer.appendChild(saveButton);
        buttonContainer.appendChild(cancelButton);

        panel.appendChild(titleInput);
        panel.appendChild(descriptionInput);
        panel.appendChild(buttonContainer);

        document.body.appendChild(panel);
        titleInput.focus();

        return panel;
    }

    static createViewPanel(note, x, y, onEdit, onDelete, onClose) {
        const panel = document.createElement('div');
        panel.className = 'note-view-panel';
        panel.style.position = 'absolute';
        panel.style.left = `${x}px`;
        panel.style.top = `${y}px`;
        panel.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        panel.style.border = '1px solidrgb(255, 255, 255)';
        panel.style.borderRadius = '10px';
        panel.style.padding = '15px';
        panel.style.boxShadow = '0 0 10pxrgb(255, 255, 255)';
        panel.style.zIndex = '1000';
        panel.style.minWidth = '200px';

        const title = document.createElement('h3');
        title.textContent = note.title;
        title.style.color = '#FFD700';
        title.style.marginBottom = '10px';

        const description = document.createElement('p');
        description.textContent = note.description;
        description.style.color = '#FFA500';
        description.style.marginBottom = '15px';

        const date = document.createElement('small');
        date.textContent = `Created: ${note.createdAt.toLocaleString()}`;
        date.style.color = '#888';
        date.style.display = 'block';
        date.style.marginBottom = '10px';

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';

        const editButton = document.createElement('button');
        editButton.innerHTML = '✎';
        editButton.style.width = '30px';
        editButton.style.height = '30px';
        editButton.style.borderRadius = '50%';
        editButton.style.backgroundColor = '#2196F3';
        editButton.style.border = 'none';
        editButton.style.color = 'white';
        editButton.style.cursor = 'pointer';

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '🗑';
        deleteButton.style.width = '30px';
        deleteButton.style.height = '30px';
        deleteButton.style.borderRadius = '50%';
        deleteButton.style.backgroundColor = '#f44336';
        deleteButton.style.border = 'none';
        deleteButton.style.color = 'white';
        deleteButton.style.cursor = 'pointer';

        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✕';
        closeButton.style.width = '30px';
        closeButton.style.height = '30px';
        closeButton.style.borderRadius = '50%';
        closeButton.style.backgroundColor = '#666';
        closeButton.style.border = 'none';
        closeButton.style.color = 'white';
        closeButton.style.cursor = 'pointer';

        editButton.addEventListener('click', () => {
            onEdit(note);
            panel.remove();
        });

        deleteButton.addEventListener('click', () => {
            onDelete(note);
            panel.remove();
        });

        closeButton.addEventListener('click', () => {
            onClose();
            panel.remove();
        });

        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(deleteButton);
        buttonContainer.appendChild(closeButton);

        panel.appendChild(title);
        panel.appendChild(description);
        panel.appendChild(date);
        panel.appendChild(buttonContainer);

        document.body.appendChild(panel);

        return panel;
    }

    toJSON() {
        return {
            title: this.title,
            description: this.description,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString()
        };
    }

    static fromJSON(json) {
        const note = new Note(json.title, json.description);
        note.createdAt = new Date(json.createdAt);
        note.updatedAt = new Date(json.updatedAt);
        return note;
    }
} 