const Menu = require('./models/Menu');
const Inventory = require('./models/Inventory');
const Staff = require('./models/Staff');


(async () => {
    
    // Create a Menu instance
    console.log('\n\n=== Menu ===\n');
    const menu = new Menu();

    // Load all menu items from database
    console.log('Loading menu items from database...');
    await menu.load();
    
    // Display all menu items
    console.log('\nAll Menu Items:');
    const menuItems = menu.getMenuItems();
    menuItems.forEach(item => {
        console.log(`  - ${item.getName()}: $${item.getPrice().toFixed(2)} (ID: ${item.getID()})`);
    });

    // Add a new menu item
    console.log('\nAdding new menu item...');
    const newItem = await menu.addMenuItem('Dust', 15.99);
    if (newItem) {
        console.log(`Added: ${newItem.getName()} for $${newItem.getPrice().toFixed(2)}`);
    }

    // Display updated menu
    console.log('\nUpdated Menu:');
    menu.getMenuItems().forEach(item => {
        console.log(`  - ${item.getName()}: $${item.getPrice().toFixed(2)}`);
    });


    // Create an Inventory Item
    console.log('\n\n=== Inventory ===\n');
    const inventory = new Inventory();

    // Load all ingredients from database
    console.log('Loading inventory from database...');
    await inventory.load();

    // Display all ingredients
    console.log('\nAll Ingredients:');
    const ingredients = inventory.getIngredients();
    ingredients.forEach(ingredient => {
        console.log(`  - ${ingredient.getName()}: (Stock: ${ingredient.getStock()}) (ID: ${ingredient.getID()})`);
    });

    // Add a new ingredient
    console.log('\nAdding new menu item...');
    const newIngredient = await inventory.addIngredient('Cobweb', 4242, 1.5);
    if (newIngredient) {
        console.log(`Added: ${newIngredient.getName()}: (Stock: ${newIngredient.getStock()}) (ID: ${newIngredient.getID()})}`);
    }

    // Display all ingredients
    console.log('\nUpdated Inventory:');
    ingredients.forEach(ingredient => {
        console.log(`  - ${ingredient.getName()}: (Stock: ${ingredient.getStock()}) (ID: ${ingredient.getID()})`);
    });


    // Create a Staff object
    console.log('\n\n=== Staff ===\n');
    const staff = new Staff();

    // Load all employees
    console.log('Loading employees from database...');
    await staff.load();

    // Display all employees
    console.log('\nAll Employees:');
    const employees = staff.getEmployees();
    employees.forEach(employee => {
        console.log(`  - ${employee.getName()}: (ID: ${employee.getID()})`);
    });

    // Add a new employee
    console.log('\nAdding new employee...');
    const newEmployee = await staff.addEmployee('Jonny Long Toe')
    if (newEmployee) {
        console.log(`Added: ${newEmployee.getName()}: (ID: ${newEmployee.getID()})}`);
    }

    // Display updated employees
    console.log('\nUpdated Employees:');
    employees.forEach(employee => {
        console.log(`  - ${employee.getName()}: (ID: ${employee.getID()})`);
    });

    // Close database connection
    await menu.close();
    await inventory.close();
    await staff.close();
})();

