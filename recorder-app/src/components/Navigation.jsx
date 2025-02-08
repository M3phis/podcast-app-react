import {NavLink} from 'react-router-dom';

const Navigation = () => {
    return (
        <nav className="main-nav">
            <NavLink 
            to="/dashboard"
            className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}
            end
            >
            
            Dashboard</NavLink>
            <NavLink 
            to="/studio"
            className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}
            >
                Studio
            </NavLink>
        </nav>

    )
}

export default Navigation;
