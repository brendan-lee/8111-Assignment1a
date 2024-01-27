const Order = require('./assignment1Order')

const OrderState = Object.freeze({
    WELCOMING: Symbol('welcoming'),
    CONFIRM_TO_BUY: Symbol('confirm to buy'),
    TYPE: Symbol('type'),
    COLOR: Symbol('color'),
    SIZE: Symbol('size'),
    CONTINUE_SHOPPING: Symbol('continue shopping'),
    UPSELLING: Symbol('upselling'),
    RECEIPT: Symbol('receipt')
})

module.exports = class BagsOrder extends Order {
    constructor() {
        super()
        this.stateCur = OrderState.WELCOMING
        this.aShoppingCart = []
        this.bUpselling = false
        this.oShoesCur = undefined
    }

    handleInput(sInput) {
        let aReturn = []

        switch (this.stateCur) {
            case OrderState.WELCOMING:
                aReturn.push('Welcome to Conestoga\'s Shoes.')
                aReturn.push('May I help you select a new pair of shoes?')

                this.stateCur = OrderState.CONFIRM_TO_BUY
                break

            case OrderState.CONFIRM_TO_BUY:
                const confirmToBuy = sInput.toLowerCase() === 'yes'

                if (!confirmToBuy) {
                    aReturn.push('No problem, if you change your mind, please let me know. See you next time :-)')
                    this.isDone(true)
                    break
                }

                aReturn.push('Great! What type of shoes are you looking for?')
                aReturn.push(`We currently offer ${sAllShoesNames} for sale.`)

                this.stateCur = OrderState.TYPE
                break

            case OrderState.TYPE:
                const foundType = aAllShoesTypes.find(type => type.name.toLowerCase() === sInput.toLowerCase())
                if (!foundType) {
                    aReturn.push('Sorry, we don\'t have that type of shoes.')
                    aReturn.push(`We currently offer ${sAllShoesNames}. Please select one of them.`)
                    break
                }

                // create a new item in the shopping cart
                const newShoes = { type: foundType }
                this.aShoppingCart.push(newShoes)
                this.oShoesCur = newShoes

                aReturn.push(`No problem. We have ${foundType.name} in the following colors: ${humanizeArrOfStr(
                    foundType.colors)}.`)
                aReturn.push('What color would you like?')

                this.stateCur = OrderState.COLOR
                break

            case OrderState.COLOR:
                const foundColor = this.oShoesCur.type.colors.find(
                    color => color.toString().toLowerCase() === sInput.toLowerCase())

                if (!foundColor) {
                    aReturn.push('Sorry, we don\'t have that color.')
                    aReturn.push(`Our ${this.oShoesCur.type.name} are only available in ${humanizeArrOfStr(
                        this.oShoesCur.type.colors)}. Please choose one of them.`)
                    break
                }

                aReturn.push(`Nice choice! Now please choose a size for your ${this.oShoesCur.type.name}.`)
                aReturn.push(`We currently have ${humanizeArrOfStr(this.oShoesCur.type.sizes)} in stock.`)

                this.oShoesCur.color = foundColor
                this.stateCur = OrderState.SIZE
                break

            case OrderState.SIZE:
                const foundSize = this.oShoesCur.type.sizes.find(
                    size => size.toString().toLowerCase() === sInput.toLowerCase())

                if (!foundSize) {
                    aReturn.push('Sorry, we don\'t have that size.')
                    aReturn.push(`We have only sizes ${humanizeArrOfStr(
                        this.oShoesCur.type.sizes)} in stock. Please choose one of them.`)
                    break
                }

                aReturn.push(`Perfect! Do you want to buy another pair of shoes?`)

                this.oShoesCur.size = foundSize
                this.stateCur = OrderState.CONTINUE_SHOPPING
                break

            case OrderState.CONTINUE_SHOPPING:
                const continueShopping = sInput.toLowerCase() === 'yes'
                if (continueShopping) {
                    this.stateCur = OrderState.TYPE
                    aReturn.push('What type of shoes are you looking for your next pair?')
                    aReturn.push(`We have ${sAllShoesNames}.`)
                    break
                }

                const nCount = this.aShoppingCart.length
                aReturn.push(
                    `Alright, you've purchased ${nCount} ${nCount === 1 ? 'pair' : 'pairs'} of shoes this time.`)
                aReturn.push('We have a special offer for you where you can add shoe cleaning service for only $999, '
                    + 'which includes five cleanings. Would you like to add it to your order?')
                this.stateCur = OrderState.UPSELLING
                break

            case OrderState.UPSELLING:
                this.bUpselling = sInput.toLowerCase() === 'yes'

                if (this.bUpselling) {
                    aReturn.push('Great! We\'ve added the shoe cleaning service to your order.')
                } else {
                    aReturn.push('No problem! We\'ll proceed with your order.')
                }

                // generate receipt
                const sShoesReceipt = this.aShoppingCart
                    .map(shoes => `${shoes.type.name} (${shoes.color}, size ${shoes.size}) - $${shoes.type.price}`)
                    .join('\n')
                const sUpsellingReceipt = this.bUpselling ? 'Shoe cleaning service - $999' : ''

                const nTotalShoesPrice = this.aShoppingCart.reduce((acc, shoes) => acc + shoes.type.price, 0)
                const nUpsellingPrice = this.bUpselling ? 999 : 0
                const nTotalPrice = nTotalShoesPrice + nUpsellingPrice

                // calculate pick up time
                let d = new Date()
                d.setMinutes(d.getMinutes() + 20)

                aReturn.push(`Here is your receipt: \n${sShoesReceipt}\n${sUpsellingReceipt}\nTotal: $${nTotalPrice}`)
                aReturn.push(`Please pick up your order at ${d.toLocaleTimeString()}.`)
                aReturn.push('Thank you for shopping with us! See you next time!')
                this.isDone(true)
                break
        }
        return aReturn
    }
}

/**
 * Combine an array of strings into a humanized string.
 *
 * E.g., ['white', 'yellow', 'green'] => 'white, yellow and green'
 * @param arr an array of strings
 * @return {string} a humanized string
 */
const humanizeArrOfStr = (arr) => arr.reduce((acc, str, idx) => {
    if (idx === 0) {
        return str
    }

    if (idx === arr.length - 1) {
        return acc + ` and ${str}`
    }

    return acc + `, ${str}`
}, '')

// mock data for shoes
const SHOES_TYPE = {
    running: {
        id: 'running',
        name: 'running shoes',
        price: 160,
        sizes: [7, 8, 9, 10, 11],
        colors: ['black', 'green', 'red']
    },
    canvas: {
        id: 'canvas',
        name: 'canvas shoes',
        price: 120,
        sizes: [7, 8, 9, 10],
        colors: ['navy', 'white', 'yellow']
    },
    hiking: {
        id: 'hiking',
        name: 'hiking shoes',
        price: 180,
        sizes: [8, 9, 10],
        colors: ['black', 'brown', 'grey']
    },
    snow: {
        id: 'snow',
        name: 'snow boots',
        price: 200,
        sizes: [8, 9, 10, 11],
        colors: ['camel', 'black', 'cyan']
    }
}

const aAllShoesTypes = Object.values(SHOES_TYPE)
const sAllShoesNames = humanizeArrOfStr(aAllShoesTypes.map(type => type.name))
