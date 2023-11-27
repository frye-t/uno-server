"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deck = void 0;
class Deck {
    constructor(cards = []) {
        this.cards = cards;
    }
    setCards(cards) {
        this.cards = cards;
    }
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    draw() {
        if (this.cards.length === 0) {
            throw new Error('No more cards in the deck');
        }
        return this.cards.shift();
    }
    printDeck() {
        this.cards.forEach((c, i) => {
            console.log(`${i}:`, c.toString());
        });
        console.log(this.cards.length);
    }
    printTopFive() {
        for (let i = 0; i < 5; i++) {
            console.log(this.cards[i].toString());
        }
    }
    insertTop(card) {
        this.cards.unshift(card);
    }
    insertBottom(card) {
        this.cards.push(card);
    }
    insertMiddle(card) {
        const deckSize = this.cards.length;
        const half = Math.floor(deckSize / 2);
        let offset = Math.floor(half / 3);
        if (deckSize <= 10)
            offset = Math.floor(deckSize / 4);
        const min = half - offset;
        const max = half + offset;
        const index = Math.floor(Math.random() * (max - min + 1)) + min;
        this.cards.splice(index, 0, card);
        return index;
    }
    size() {
        return this.cards.length;
    }
    peek(index = 0) {
        if (index < 0 || index >= this.cards.length) {
            throw new Error('Index out of bounds');
        }
        return this.cards[index];
    }
    clear() {
        this.cards = [];
    }
    isEmpty() {
        return this.cards.length === 0;
    }
    clone() {
        return new Deck([...this.cards]);
    }
    merge(otherDeck) {
        this.cards = [...this.cards, ...otherDeck.cards];
    }
    drawMultiple(num) {
        if (num > this.cards.length) {
            throw new Error('Not enough cards in the deck');
        }
        return Array.from({ length: num }, () => this.draw());
    }
    countCardType(predicate) {
        return this.cards.filter(predicate).length;
    }
}
exports.Deck = Deck;
//# sourceMappingURL=deck.js.map