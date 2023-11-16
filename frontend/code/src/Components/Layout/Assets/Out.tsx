import { classNames } from "../../../Utils/helpers";
import { useUserStore } from "../../../Stores/stores";
import { Link } from "react-router-dom";

type OutProps = React.HTMLAttributes<HTMLDivElement> & {
  selected?: boolean;
};
export const Out = ({ selected, className, ...props }: OutProps) => {
  const user = useUserStore();
  return (
    <>
      {process.env?.REACT_APP_LOGOUT && (
        <Link onClick={() => user.logout()} to={process.env.REACT_APP_LOGOUT}>
          <div
            className={classNames(
              "h-9 w-9 hover:bg-secondary rounded-xl flex justify-center items-center hover:cursor-pointer",
              selected && "bg-secondary",
              className,
            )}
            {...props}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 7.13193V6.61204C7 4.46614 7 3.3932 7.6896 2.79511C8.37919 2.19703 9.44136 2.34877 11.5657 2.65224L15.8485 3.26408C18.3047 3.61495 19.5327 3.79039 20.2664 4.63628C21 5.48217 21 6.72271 21 9.20377V14.7962C21 17.2773 21 18.5178 20.2664 19.3637C19.5327 20.2096 18.3047 20.385 15.8485 20.7359L11.5657 21.3478C9.44136 21.6512 8.37919 21.803 7.6896 21.2049C7 20.6068 7 19.5339 7 17.388V17.066"
                stroke="#BDBDBD"
                strokeWidth="2"
              />
              <path
                d="M16 12L16.7809 11.3753L17.2806 12L16.7809 12.6247L16 12ZM4 13C3.44771 13 3 12.5523 3 12C3 11.4477 3.44771 11 4 11V13ZM12.7809 6.3753L16.7809 11.3753L15.2191 12.6247L11.2191 7.6247L12.7809 6.3753ZM16.7809 12.6247L12.7809 17.6247L11.2191 16.3753L15.2191 11.3753L16.7809 12.6247ZM16 13H4V11H16V13Z"
                fill="#BDBDBD"
              />
            </svg>
          </div>
        </Link>
      )}
    </>
  );
};
