const createPokemon = (pokemonImg, type) => {
    const img = document.createElement('img')
    img.setAttribute('src', pokemonImg)
    img.setAttribute('class', `pokemon ${type}`)
    return img
}