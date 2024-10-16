document.addEventListener('DOMContentLoaded', () => {
    const pokemonsURL = 'https://pokeapi.co/api/v2/pokemon?limit=6&offset'
    
    const logo = document.getElementById('pokemon_logo')
    const pokemon_list = document.querySelector('.pokemon_list')
    const container = document.querySelector('.container')
    const startBtn = createStartBtn()

    // Глобальные стейт
    let pokemonsList = []

    const renderPlayer = (type, pokemon) => { 
        if(pokemon) {
            const filterPokemon = pokemon.stats.filter(item => item.type === 'hp' || item.type === 'attack' || item.type === 'defense')

            const stats = filterPokemon.map((item) => (
                `<span id="${type}_${item.type}">${item.type}: ${item.value}</span>`
            ))
    
            const wrappedDiv = document.createElement('div')
            wrappedDiv.setAttribute('class', `${type} player`)
            wrappedDiv.innerHTML = `
                <img src="${pokemon.images.front}" alt="pokemon">
                <p class="pokemon_stat">
                    <span>Name: ${pokemon?.name}</span>
                    ${stats[0]}
                    ${stats[1]}
                    ${stats[2]}
                </p>
                ${type === 'user' ? '<button id="attack_btn">ATTACK</button>' : ''}
            `

            return wrappedDiv
        }
    }

    const user = {
        pokemon: null,
        selectPokemon: function(pokemon) {
            this.pokemon = pokemon
        },
        renderPokemon: function() {
            const userPlayer = renderPlayer('user', this.pokemon)
            container.appendChild(userPlayer)
        },
        changeHP: function(dmg) {
            const hp = this.pokemon.stats.find(item => item.type === 'hp').value
            const def = this.pokemon.stats.find(item => item.type === 'defense').value
            const result = Math.floor((hp + (def * 2)) * 1.2 - dmg)
            
            const copyState = this.pokemon
            copyState.stats = copyState.stats.map((item) => {
                if(item.type === 'hp') item.value = result
                return item
            })

            this.pokemon = copyState

            const userHP = document.getElementById('user_hp')
            userHP.innerText = `Hp: ${result}`
        },
        attack: function() {
            const dmg = this.pokemon.stats.find(item => item.type === 'attack').value
            return dmg
        }
    }

    const computer = {
        pokemon: null,
        selectPokemon: function(pokemon) {
            this.pokemon = pokemon
        },
        renderPokemon: function() {
            const userPlayer = renderPlayer('computer', this.pokemon)
            container.appendChild(userPlayer)
        },
        changeHP: function(dmg) {
            const hp = this.pokemon.stats.find(item => item.type === 'hp').value
            const def = this.pokemon.stats.find(item => item.type === 'defense').value
            const result = Math.floor((hp + (def * 2)) * 1.2 - dmg)
            
            const copyState = this.pokemon
            copyState.stats = copyState.stats.map((item) => {
                if(item.type === 'hp') item.value = result
                return item
            })

            this.pokemon = copyState

            const computerHP = document.getElementById('computer_hp')
            computerHP.innerText = `Hp: ${result}`
        },
        attack: function() {
            const dmg = this.pokemon.stats.find(item => item.type === 'attack').value
            return dmg
        }
    }


    const createPokemonCard = (id, img, pokemonName) => {
        const wrappedDiv = document.createElement('div')
        wrappedDiv.setAttribute('class', 'pokemon_card')
        wrappedDiv.setAttribute('id', id)
        wrappedDiv.innerHTML = `
            <img src="${img}" alt="pokemon">
            <p>
                <span>${pokemonName}</span>
            </p>   
        `
        return wrappedDiv
    }

    const getDetailPokemons = async (pokemonList) => {
        const result = await Promise.all(
            pokemonList.map(async (item) => {
                const res = await fetch(item.url)
                return await res.json()
            })
        )

        const resMapped = result.map((item) => ({
            id: item.id,
            name: item.name,
            images: {
                front: item.sprites.front_default,
                back: item.sprites.back_default
            },
            stats: item.stats.map((item) => ({
                type: item.stat.name,
                value: item.base_stat
            }))
        }))

        return resMapped
    }


    const getRandomPokemons = async () => {
        const randomOffset = Math.floor(Math.random() * 1000)

        const result = await fetch(`${pokemonsURL}=${randomOffset}`)
        const parseRes = await result.json()

        pokemonsList = await getDetailPokemons(parseRes.results)

        pokemon_list.innerHTML = null
        pokemonsList.forEach((item) => {
            const card = createPokemonCard(item.id, item.images.front, item.name)
            pokemon_list.appendChild(card)
        })
    }


    // По клику идет рендер рандомных 6 покемонов
    logo.addEventListener('click', (e) => {
        e.stopPropagation();
        getRandomPokemons()
    })

    const removeOnePokemon = (id) => {
        const element = document.getElementById(id)
        element.remove()
    }

    // По клику идет выбор покемонов
    pokemon_list.addEventListener('click', (e) => {
        const id = e.target.attributes.id.value
        const userPokemon = pokemonsList.find(item => item.id === parseInt(id))
        user.selectPokemon(userPokemon)
        user.renderPokemon()
        removeOnePokemon(id)

        setTimeout(() => {
            const computerPokemon = pokemonsList.filter(item => item.id !== parseInt(id)).sort(() => Math.random() - 0.5)[0]
            computer.selectPokemon(computerPokemon)
            computer.renderPokemon()
            removeOnePokemon(computerPokemon.id)

            pokemon_list.innerHTML = null
            pokemon_list.appendChild(startBtn)
        }, 1500)
    })

    startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const arena = createArena()
        const userPokemon = createPokemon(user.pokemon.images.front, 'pokemon_user')
        const computerPokemon = createPokemon(computer.pokemon.images.front, 'pokemon_computer')
        arena.appendChild(userPokemon)
        arena.appendChild(computerPokemon)
        pokemon_list.innerHTML = null
        pokemon_list.appendChild(arena)

        const attack = document.getElementById('attack_btn')

        attack.addEventListener('click', (e) => {
            e.stopPropagation()

            const userDmg = user.attack()            
            computer.changeHP(userDmg)

            setTimeout(() => {
                const computerDmg = computer.attack()
                user.changeHP(userDmg)
            }, 800)
        })
    })
})