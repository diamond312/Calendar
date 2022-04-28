// Credits: borrowed code from fcomb/redux-logger

const deepCopy = (obj, cache = []) => {
    // just return if obj is immutable value
    if (obj === null || typeof obj !== 'object') {
        return obj
    }

    // if obj is hit, it is in circular structure
    const hit = find(cache, c => c.original === obj)
    if (hit) {
        return hit.copy
    }

    const copy = Array.isArray(obj) ? [] : {}
    // put the copy into cache at first
    // because we want to refer it in recursive deepCopy
    cache.push({
        original: obj,
        copy,
    })

    Object.keys(obj).forEach(key => {
        copy[key] = deepCopy(obj[key], cache)
    })

    return copy
}

export default function createLogger({
    collapsed = true,
    filter = (mutation, stateBefore, stateAfter) => true,
    transformer = state => state,
    mutationTransformer = mut => mut,
} = {}) {
    return store => {
        let prevState = deepCopy(store.state)

        store.subscribe((mutation, state) => {
            if (typeof console === 'undefined') {
                return
            }
            const nextState = deepCopy(state)

            if (filter(mutation, prevState, nextState)) {
                const time = new Date()
                const formattedTime = ` @ ${pad(time.getHours(), 2)}:${pad(time.getMinutes(), 2)}:${pad(
                    time.getSeconds(),
                    2
                )}.${pad(time.getMilliseconds(), 3)}`
                const formattedMutation = mutationTransformer(mutation)
                const message = `mutation ${mutation.type}${formattedTime}`
                const startMessage = collapsed ? console.groupCollapsed : console.group

                // render
                try {
                    startMessage.call(console, message)
                } catch (e) {
                    console.log(message)
                }

                console.log('%c prev state', 'color: #9E9E9E; font-weight: bold', transformer(prevState))
                console.log('%c mutation', 'color: #03A9F4; font-weight: bold', formattedMutation)
                console.log('%c next state', 'color: #4CAF50; font-weight: bold', transformer(nextState))

                try {
                    console.groupEnd()
                } catch (e) {
                    console.log('—— log end ——')
                }
            }

            prevState = nextState
        })
    }
}

function repeat(str, times) {
    return new Array(times + 1).join(str)
}

function pad(num, maxLength) {
    return repeat('0', maxLength - num.toString().length) + num
}
