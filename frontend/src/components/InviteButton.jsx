
import styled from 'styled-components';

const InviteButton = ({ text,onClick }) => {

  return (
    <StyledWrapper>
      <button onClick={onClick}>
        <span className="button_top">{text}</span>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  button {
    /* Variables */
    --button_radius: 0.75em;
    --button_color: #e8e8e8;
    --button_outline_color: #000000;
    font-size: 15px;
    font-weight: bold;
    border: none;
    cursor: pointer;
    border-radius: var(--button_radius);
    background: var(--button_outline_color);
  }

  .button_top {
    display: block;
    box-sizing: border-box;
    border: 2px solid var(--button_outline_color);
    border-radius: var(--button_radius);
    padding: 0.4em 1em;
    background: var(--button_color);
    color: var(--button_outline_color);
    transform: translateY(-0.2em);
    transition: transform 0.1s ease;
  }

  button:hover .button_top {
    /* Pull the button upwards when hovered */
    transform: translateY(-0.33em);
  }

  button:active .button_top {
    /* Push the button downwards when pressed */
    transform: translateY(0);
  }`;

export default InviteButton;
