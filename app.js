// Storage Controller
const StorageCtrl = (function () {
    // Public methods
    return {
        storeItem: function (item) {
            let items;
            // Check if any items in ls
            if (!localStorage.getItem('items')) {
                items = [];
                // Push the new item
                items.push(item);
                // Set ls
                localStorage.setItem('items', JSON.stringify(items));
            } else {
                // Get existing data from ls
                items = JSON.parse(localStorage.getItem('items'));

                // Push the new item
                items.push(item);

                // Re set ls
                localStorage.setItem('items', JSON.stringify(items));
            }
        },
        getItemsFromStorage: function () {
            let items;
            if (!localStorage.getItem('items')) {
                items = [];
            } else {
                items = JSON.parse(localStorage.getItem('items'));
            }
            return items;
        },
        updateItemStorage: function (updatedItem) {
            let items = StorageCtrl.getItemsFromStorage();

            items.forEach((item, index) => {
                if (updatedItem.id === item.id) {
                    items.splice(index, 1, updatedItem);
                }
            });

            localStorage.setItem('items', JSON.stringify(items));
        },
        deleteItemFromStorage: function (id) {
            let items = StorageCtrl.getItemsFromStorage();

            items.forEach((item, index) => {
                if (id === item.id) {
                    items.splice(index, 1);
                }
            });

            localStorage.setItem('items', JSON.stringify(items));
        },
        clearItemsFromStorage: function () {
            localStorage.removeItem('items');
        }
    }
})();

// Item Controller
const ItemCtrl = (function() {
    // Item Constructor
    const Item = function(id, name, calories) {
        this.id = id;
        this.name = name;
        this.calories = calories;
    };

    // Data Structure / State
    const data = {
        items: StorageCtrl.getItemsFromStorage(),
        currentItem: null,
        totalCalories: 0
    };

    // Public methods
    return {
        getItems: function() {
            return data.items
        },
        getItemById: function(id) {
            let found = null;
            // Loop through items
            data.items.forEach(item => {
                if (item.id === id) {
                    found = item;
                }
            });
            return found;
        },
        addItem: function(name, calories) {
            let ID;
            // Create ID
            if (data.items.length === 0) {
                ID = 0;
                // ID = data.items[data.items.length - 1].id + 1;
            } else {
                const ids = data.items.map(item => item.id);
                ID = Math.max.apply(null, ids) + 1;
                // ID = 0;
            }

            // Calories to number
            calories = parseInt(calories);

            // Create new item
            const newItem = new Item(ID, name, calories);

            // Add to items array
            data.items.push(newItem);

            return newItem;
        },
        updateItem: function(name, calories) {
            // Calories to number
            calories = parseInt(calories);

            let found = null;

            data.items.forEach(item => {
                if (item.id === data.currentItem.id) {
                    item.name = name;
                    item.calories = calories;
                    found = item;
                }
            });

            return found;
        },
        deleteItem: function(id) {
            // Get ids
            const ids = data.items.map(item => item.id);

            // Get index
            const index = ids.indexOf(id);

            // Remove item
            data.items.splice(index, 1);
        },
        clearAllItems: function() {
            data.items.length = 0;
        },
        setCurrentItem: function (item) {
            data.currentItem = item;
        },
        getCurrentItem: function () {
            return data.currentItem;
        },
        getTotalCalories: function() {
            let total = 0;

            // Loop through items and add calories
            data.items.forEach(item => {
                total += item.calories;
            });

            // Set total calories in data structure
            data.totalCalories = total;

            // Return total
            return data.totalCalories;
        },
        logData: function() {
            return data;
        }
    }
})();



// UI Controller
const UICtrl = (function() {
    const UISelectors = {
        listContainer: '.collection',
        listItems: '.collection li',
        addBtn: '.add-btn',
        updateBtn: '.update-btn',
        deleteBtn: '.delete-btn',
        clearAllBtn: '.clear-btn',
        backBtn: '.back-btn',
        itemNameInput: '#item-name',
        itemCaloriesInput: '#item-calories',
        totalCaloriesHeader: '.total-calories-header',
        totalCalories: '.total-calories'
    };

    // Creates DOM element
    const createDOMElement = function(el, id, className) {
        // Create the ul element
        const element = document.createElement(el);

        // Add ID
        if (id) element.id = id;

        // Add class
        if (className) element.className = className;

        return element;
    };

    // Public methods
    return {
        populateItemList: function(items) {
            if (items.length) {
                // Sibling before the ul
                const totalCaloriesHeader = document.querySelector(UISelectors.totalCaloriesHeader);
                // Create the ul
                const ul = createDOMElement('ul', 'item-list', 'collection');
                // Insert the ul in the DOM
                totalCaloriesHeader.parentNode.insertBefore(ul, totalCaloriesHeader.nextSibling);

                let html = '';
                items.forEach(item => {
                    html += `<li class="collection-item" id="${item.id}">
                                <strong>${item.name}:</strong> <em>${item.calories} Calories</em>
                                <a href="#" class="secondary-content"><i class="edit-item fa fa-pencil"></i></a>
                            </li>`;
                });
                // Insert list items
                ul.innerHTML = html;
            }
        },
        getItemInput: function() {
            return {
                name: document.querySelector(UISelectors.itemNameInput).value,
                calories: document.querySelector(UISelectors.itemCaloriesInput).value
            }
        },
        addListItem: function(item) {
            // If first item, create he ul element first
            if (ItemCtrl.getItems().length === 1) {
                // Sibling before the ul
                const totalCaloriesHeader = document.querySelector(UISelectors.totalCaloriesHeader);
                const ul = createDOMElement('ul', 'item-list', 'collection');
                // Insert the ul in the DOM
                totalCaloriesHeader.parentNode.insertBefore(ul, totalCaloriesHeader.nextSibling);
            }

            // Create li element
            const li = createDOMElement('li', `item-${item.id}`, 'collection-item');
            // Add HTML
            li.innerHTML = `<strong>${item.name}:</strong> <em>${item.calories} Calories</em>
            <a href="#" class="secondary-content"><i class="edit-item fa fa-pencil"></i></a>`;
            // Insert item
            document.querySelector(UISelectors.listContainer).insertAdjacentElement('beforeend', li)
        },
        updateListItem: function(item) {
            let listItems = document.querySelectorAll(UISelectors.listItems);

            // Turn Node list into array
            listItems = Array.from(listItems);

            listItems.forEach(listItem => {
                const itemID = listItem.getAttribute('id');

                if (itemID === `item-${item.id}`) {
                    document.querySelector(`#${itemID}`).innerHTML = `<strong>${item.name}:</strong> <em>${item.calories} Calories</em>
            <a href="#" class="secondary-content"><i class="edit-item fa fa-pencil"></i></a>`;
                }
            })
        },
        deleteListItem: function(id) {
            let itemID = `#item-${id}`;
            let item = document.querySelector(itemID);
            if (item === null) {
                item = document.getElementById(id);
            }
            item.remove();
            // Delete the ul if deleted last item
            UICtrl.deleteListContainer();
        },
        clearInput: function() {
            document.querySelector(UISelectors.itemNameInput).value = '';
            document.querySelector(UISelectors.itemCaloriesInput).value = '';
        },
        addItemToForm: function () {
            document.querySelector(UISelectors.itemNameInput).value = ItemCtrl.getCurrentItem().name;
            document.querySelector(UISelectors.itemCaloriesInput).value = ItemCtrl.getCurrentItem().calories;
            UICtrl.showEditState();
        },
        removeAllItems: function() {
            let listItems = document.querySelectorAll(UISelectors.listItems);

            // Turn Node list into array
            listItems = Array.from(listItems);

            listItems.forEach(item => {
                item.remove();
            })
        },
        deleteListContainer: function() {
            const ul = document.querySelector(UISelectors.listContainer);

            if (!ul.innerHTML) {
                ul.remove();
            }
        },
        showTotalCalories: function(totalCalories) {
            document.querySelector(UISelectors.totalCalories).textContent = totalCalories;
        },
        clearEditState: function() {
            UICtrl.clearInput();
            document.querySelector(UISelectors.addBtn).style.display = 'inline';
            document.querySelector(UISelectors.updateBtn).style.display = 'none';
            document.querySelector(UISelectors.deleteBtn).style.display = 'none';
            document.querySelector(UISelectors.backBtn).style.display = 'none';
        },
        showEditState: function() {
            document.querySelector(UISelectors.addBtn).style.display = 'none';
            document.querySelector(UISelectors.updateBtn).style.display = 'inline';
            document.querySelector(UISelectors.deleteBtn).style.display = 'inline';
            document.querySelector(UISelectors.backBtn).style.display = 'inline';
        },
        getSelectors: function() {
            return UISelectors;
        }
    }
})();

// App Controller
const App = (function(ItemCtrl, StorageCtrl, UICtrl) {
    // Load event listeners
    const loadEventListeners = function() {
        // Get UI selectors
        const UISelectors = UICtrl.getSelectors();

        // Add item event
        document.querySelector(UISelectors.addBtn).addEventListener('click', itemAddSubmit);

        // Disable submit button when editing item
        document.addEventListener('keypress', function (e) {
            if (e.code === 'Enter' || e.keyCode === 13 || e.which === 13) {
                e.preventDefault();
                return false;
            }
        });

        if (ItemCtrl.getItems().length) {
            // Edit icon click event
            document.querySelector(UISelectors.listContainer).addEventListener('click', itemEditClick);

            // Update item event
            document.querySelector(UISelectors.updateBtn).addEventListener('click', itemUpdateSubmit);

            // Delete item event
            document.querySelector(UISelectors.deleteBtn).addEventListener('click', itemDeleteSubmit);

            // Back button event
            document.querySelector(UISelectors.backBtn).addEventListener('click', (e) => {
                e.preventDefault();

                UICtrl.clearEditState();
            });

            // Clear items event
            document.querySelector(UISelectors.clearAllBtn).addEventListener('click', clearAllItemsClick);
        }
    };

    // Add item submit
    const itemAddSubmit = function(e) {
        e.preventDefault();

        // Get form input from UI Controller
        const input = UICtrl.getItemInput();

        // Validation for name and calorie input
        if (input.name.trim() && input.calories.trim()) {
            // Capitalize inputs
            const name = FunctionalityCtrl.capitalizeAll(input.name.trim());
            const calories = FunctionalityCtrl.capitalizeAll(input.calories.trim());

            // Add Item
            const newItem = ItemCtrl.addItem(name, calories);

            // Add item to UI list
            UICtrl.addListItem(newItem);

            // Get total calories
            const totalCalories = ItemCtrl.getTotalCalories();

            // Add total calories to UI
            UICtrl.showTotalCalories(totalCalories);

            // Store in localStorage
            StorageCtrl.storeItem(newItem);

            // Clear fields
            UICtrl.clearInput();

            // Update the event listeners
            loadEventListeners();
        }
    };

    // Click edit item
    const itemEditClick = function(e) {
        e.preventDefault();

        if (e.target.classList.contains('edit-item')) {
            // Get list item id
            const listId = e.target.parentNode.parentNode.id;

            // Break into an array
            const listIdArr = listId.split('-');

            // Get the actual id
            let id;
            listIdArr.length === 1 ? id = parseInt(listIdArr[0]) : id = parseInt(listIdArr[1]);

            // Get item
            const itemToEdit = ItemCtrl.getItemById(id);

            // Set current item
            ItemCtrl.setCurrentItem(itemToEdit);

            // Add item to form
            UICtrl.addItemToForm();
        }
    };

    // Update item submit
    const itemUpdateSubmit = function (e) {
        e.preventDefault();

        // Get item input
        const input = UICtrl.getItemInput();

        // Validation for name and calorie input
        if (input.name.trim() && input.calories.trim()) {
            // Capitalize inputs
            const name = FunctionalityCtrl.capitalizeAll(input.name.trim());
            const calories = FunctionalityCtrl.capitalizeAll(input.calories.trim());

            // Update item
            const updatedItem = ItemCtrl.updateItem(name, calories);

            // Update UI
            UICtrl.updateListItem(updatedItem);

            // Get total calories
            const totalCalories = ItemCtrl.getTotalCalories();

            // Add total calories to UI
            UICtrl.showTotalCalories(totalCalories);

            // Update localStorage
            StorageCtrl.updateItemStorage(updatedItem);

            UICtrl.clearEditState();
        }
    };

    // Delete button submit
    const itemDeleteSubmit = function (e) {
        e.preventDefault();

        // Get current item
        const currentItem = ItemCtrl.getCurrentItem();

        // Delete from data structure
        ItemCtrl.deleteItem(currentItem.id);

        // Delete from UI
        UICtrl.deleteListItem(currentItem.id);

        // Get total calories
        const totalCalories = ItemCtrl.getTotalCalories();

        // Delete from localStorage
        StorageCtrl.deleteItemFromStorage(currentItem.id);

        // Add total calories to UI
        UICtrl.showTotalCalories(totalCalories);

        UICtrl.clearEditState();
    };

    // Clear items event
    const clearAllItemsClick = function (e) {
        e.preventDefault();
        // Delete all items from data structure
        ItemCtrl.clearAllItems();

        // Get total calories
        const totalCalories = ItemCtrl.getTotalCalories();

        // Add total calories to UI
        UICtrl.showTotalCalories(totalCalories);

        // Remove from UI
        UICtrl.removeAllItems();

        // Clear from localStorage
        StorageCtrl.clearItemsFromStorage();

        // Delete the ul
        UICtrl.deleteListContainer();
    };

    // Public methods
    return {
        init: function() {
            // Clear edit state / set initial state
            UICtrl.clearEditState();

            // Fetch items from data structure
            const items = ItemCtrl.getItems();

            // Populate list with items
            UICtrl.populateItemList(items);

            // Get total calories
            const totalCalories = ItemCtrl.getTotalCalories();

            // Add total calories to UI
            UICtrl.showTotalCalories(totalCalories);

            // Load event listeners
            loadEventListeners();
        }
    }

})(ItemCtrl, StorageCtrl, UICtrl);

// Functionality Controller
const FunctionalityCtrl = (function() {
    return {
        capitalizeAll: function(str) {
            str = str.split(" ");

            for (let i = 0, x = str.length; i < x; i++) {
                str[i] = str[i][0].toUpperCase() + str[i].substr(1);
            }

            return str.join(" ");
        }
    }
})();

// Initialize App
App.init();
