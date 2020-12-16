
class Configs {
    async getConfigs() {
        let configs = {
            min_price_diff: 1,
            max_price_diff: 999999999,
            min_sale_price_diff: 1,
            max_sale_price_diff: 999999999,
            enable_main_bot: true,
            groupIds: [-275702339]
        }
        return configs;
    }
}

module.exports = Configs;