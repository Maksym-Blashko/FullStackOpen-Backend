module.exports = function(number) {
    if (number.length < 8) {
        return false
    }

    const parts = number.split('-')
    if (parts.length !== 2) {
        return false
    }

    const firstPart = parts[0]
    if (!/^\d{2,3}$/.test(firstPart)) {
        return false
    }

    const secondPart = parts[1]
    if (!/^\d+$/.test(secondPart)) {
        return false
    }

    return true
}
