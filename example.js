const MenuItem = require('./database/menu_item');

(async () => {
    console.log('=== MenuItem Usage Patterns ===\n');

    // Pattern 1: Factory Method (Recommended) - Loads from database
    console.log('Pattern 1: Factory Method');
    const item1 = await MenuItem.create(1);
    console.log(`Item: ${item1.name}, Price: $${item1.price.toFixed(2)}`);
    console.log(`ID: ${item1.getID()}\n`);

    // Pattern 2: Direct Instantiation - Use when you have data
    console.log('Pattern 2: Direct Instantiation');
    const item2 = new MenuItem(2, 'Dust', 14.99);
    console.log(`Item: ${item2.getName()}, Price: $${item2.getPrice().toFixed(2)}`);
    console.log(`ID: ${item2.getID()}\n`);

    // Updating values
    console.log('Updating Values:');
    await item1.setName('Dustier Dust');
    await item1.setPrice(11.99);
    console.log(`Updated - Name: ${item1.getName()}, Price: $${item1.getPrice().toFixed(2)}\n`);

    // Close connections
    await item1.close();
})();