const MenuItem = require('./MenuItem');

(async () => {
    const menuItem = await MenuItem.create(1);
    console.log(`Item: ${menuItem.name}, Price: $${menuItem.price.toFixed(2)}`);
    await menuItem.close();
})();