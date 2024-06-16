import WildermedIcon from "../components/ui/WildermedIcon"

export const Footer = () => {

  const today = new Date();
  const year = today.getFullYear();

  return (
    <footer>
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2 md:px-0">
          <p className="text-center md:text-sm text-xs leading-loose md:text-left text-[#283618]">
            ©️ {year}{" "}
            <a
              href="https://www.secondpath.dev"
              target="_blank"
              className="font-medium underline underline-offset-4"
            >
              Second Path Studio
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
