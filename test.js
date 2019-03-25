// Slomux - реализация Flux, в которой, как следует из нвазвания, что-то сломано.
// Нужно выяснить что здесь сломано

const createStore = (reducer, initialState) => {
    let currentState = initialState
    const listeners = []

    const getState = () => currentState
    const dispatch = action => {
        currentState = reducer(currentState, action)
        listeners.forEach(listener => listener())
    }

    const subscribe = listener => listeners.push(listener)

    return {getState, dispatch, subscribe}
}

const connect = (mapStateToProps, mapDispatchToProps) =>
    Component => {
        // need add window for store (store is global odj) and put props into component
        return class extends React.Component {
            render() {
                return (
                    <Component
                        {...this.props}
                        {...mapStateToProps(window.store.getState(), this.props)}
                        {...mapDispatchToProps(window.store.dispatch, this.props)}
                    />
                )
            }

            componentDidMount() {
                // stor is global in Provider
                window.store.subscribe(this.handleChange)
            }

            handleChange = () => {
                this.forceUpdate()
            }
        }
    }

class Provider extends React.Component {
    componentWillMount() {
        window.store = this.props.store
    }

    render() {
        return this.props.children
    }
}

// APP

// actions
const ADD_TODO = 'ADD_TODO'

// action creators
const addTodo = todo => ({
    type: ADD_TODO,
    payload: todo,
})

// reducers
const reducer = (state = [], action) => {
    switch (action.type) {
        case ADD_TODO:
            state.push(action.payload)
            return state
        default:
            return state
    }
}

// components
class ToDoComponent extends React.Component {
    state = {
        todoText: ''
    }

    render() {
        return (
            <div>
                <label>{this.props.title || 'Без названия'}</label>
                <div>
                    <input
                        value={this.state.todoText}
                        placeholder="Название задачи"
                        onChange={this.updateText}
                    />
                    <button onClick={this.addTodo}>Добавить</button>
                    <ul>
                        {/*need use key for array*/}
                        {this.props.todos.map((todo, idx) => <li>{todo}</li>)}
                    </ul>
                </div>
            </div>
        )
    }

    // updateText has own this and this.state is not avalible
    // can create like arrow func without own this
    updateText = (e) => {
        const value = e.target.value
        // for state updating, need use setState()
        this.setState({todoText: value})
    }

    addTodo = () => {
        //check for empty input
        if (this.state.todoText !== '') {
            this.props.addTodo(this.state.todoText)
            // for state updating, need use setState()
            this.setState({todoText: ""})
        } else {
            console.log('WARNING - an attempt to add an empty value to the TODO list')
        }
    }
}

const ToDo = connect(state => ({
    todos: state,
}), dispatch => ({
    addTodo: text => dispatch(addTodo(text)),
}))(ToDoComponent)

// init
ReactDOM.render(
    <Provider store={createStore(reducer, [])}>
        <ToDo title="Список задач"/>
    </Provider>,
    document.getElementById('app')
)