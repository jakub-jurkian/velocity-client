import { getAvatarStyle, getInitials } from "../../utils/avatar";
import { cx } from "../../utils/cx";
import styles from "./Avatar.module.scss";

interface Props {
  // Seeds the colour, so it survives a rename.
  id: string;
  name: string;
  size?: number;
  className?: string;
}

// A user's initials on a colour that is stable for them and differs between
// users. Decorative: the name is always shown or announced nearby.
const Avatar = ({ id, name, size = 40, className }: Props) => (
  <div
    className={cx(styles.avatar, className)}
    style={{ ...getAvatarStyle(id), width: size, height: size, fontSize: size * 0.36 }}
    aria-hidden="true"
  >
    {getInitials(name)}
  </div>
);

export default Avatar;
