/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операции
    const discount = 1 - (purchase.discount / 100);
    return purchase.sale_price * purchase.quantity * discount;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    // @TODO: Расчет бонуса от позиции в рейтинге
     if (index === 0) {
        return seller.profit * 0.15;
    } else if (index === 1 || index === 2) {
        return seller.profit * 0.10;
    } else if (index === total - 1) {
        return 0;
    } else {
        return seller.profit * 0.05;
    }
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    // @TODO: Проверка входных данных

    // @TODO: Проверка наличия опций

    // @TODO: Подготовка промежуточных данных для сбора статистики

    // @TODO: Индексация продавцов и товаров для быстрого доступа

    // @TODO: Расчет выручки и прибыли для каждого продавца

    // @TODO: Сортировка продавцов по прибыли

    // @TODO: Назначение премий на основе ранжирования

    // @TODO: Подготовка итоговой коллекции с нужными полями
         if (!data.data(purchase_records)) {
        throw new Error("Некорректные данные");
    }

    if (!purchase_records.length === 0){
        return 0
    }

    const calculateRevenue = options.calculateRevenue;

    // === Индексация ===
    const sellerIndex = {};
    const productIndex = {};

    data.sellers.forEach(s => {
        sellerIndex[s.id] = {
            id: s.id,
            name: `${ s.first_name} ${s.last_name}`,
            revenue: 0,
            profit: 0,
            sales_count: 0,
            products_sold: {}
        };
    });

    data.products.forEach(p => {
        productIndex[p.sku] = p;
    });

    const sellerStats = Object.values(sellerIndex);

    // ===  Шаг 1: двойной цикл ===
    data.purchase_records.forEach(record => {

        const seller = sellerIndex[record.seller_id];

        // увеличиваем количество продаж
        seller.sales_count += 1;

        // увеличиваем выручку по чеку
        seller.revenue += record.total_amount;

        record.items.forEach(item => {

            const product = productIndex[item.sku];

            // себестоимость
            const cost = product.purchase_price * item.quantity;

            // выручка
            const revenue = calculateRevenue(item, product);

            // прибыль
            const profit = revenue - cost;

            // накапливаем прибыль
            seller.profit += profit;

            // === учет товаров ===
            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }

            seller.products_sold[item.sku] += item.quantity;
        });
    });

    // === Шаг 2: сортировка ===
    sellerStats.sort((a, b) => b.profit - a.profit);

    // === Шаг 3: бонусы и топ товаров ===
    sellerStats.forEach((seller, index) => {

        // бонус
        seller.bonus = calculateBonusByProfit(index, sellerStats.length, seller);

        // топ-10 товаров
        seller.top_products = Object.entries(seller.products_sold)
            .map(([sku, quantity]) => ({ sku, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
    });
}

    // === Шаг 4: финальный результат ===
    return sellerStats.map(seller => ({
        seller_id: seller.id,
        name: seller.name,
        revenue: +seller.revenue.toFixed(2),
        profit: +seller.profit.toFixed(2),
        sales_count: seller.sales_count,
        top_products: seller.top_products,
        bonus: +seller.bonus.toFixed(2)
    }));

