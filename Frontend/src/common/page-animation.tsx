import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Props = {
    children: ReactNode
    initial?: object
    animate?: object
    transition?: object
    className?: string
}
const PageAnimation: React.FC<Props> = ({ children, initial = { opacity: 0 }, animate = { opacity: 1 }, transition = { duration: 0.7 }, className = "" }) => {
    return (
        <AnimatePresence>
            <motion.div
                initial={initial}
                animate={animate}
                transition={transition}
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
export default PageAnimation
