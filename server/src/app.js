const Menu = require('./models/Menu');

(async () => {
    console.log('=== Menu ===\n');

    // Create a Menu instance
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

    // Close database connection
    await menu.close();
})();

