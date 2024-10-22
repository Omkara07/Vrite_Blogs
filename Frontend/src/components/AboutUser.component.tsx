import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faFacebook, faInstagram, faYoutube, faGithub, faXTwitter } from '@fortawesome/free-brands-svg-icons'; // Import specific icons
import { FaGlobe } from 'react-icons/fa6';
import { getDate } from '../common/Days';

type Props = {
    classname: string;
    social_links: { [key: string]: string }; // Correct type for social_links
    bio: string;
    joinedAt: string;
};

const AboutUser: React.FC<Props> = ({ classname, bio, joinedAt, social_links }) => {
    // Mapping brand names to their respective FontAwesome icons
    const iconsMap: { [key: string]: any } = {
        twitter: faXTwitter,
        facebook: faFacebook,
        instagram: faInstagram,
        github: faGithub,
        youtube: faYoutube,
    };

    return (
        <div className={`flex flex-col w-full md:w-[90%] md:mt-7 ${classname} items-center`}>
            <p className="text-xl leading-7">
                {bio.length ? bio : 'Nothing to display here'}
            </p>
            <div className="flex gap-x-7 gap-y-2 flex-wrap my-7 items-center">
                {Object.keys(social_links).map((key, i) => {
                    const link = social_links[key];
                    const icon = iconsMap[key.toLowerCase()]; // Get icon based on the key

                    return link ? (
                        <Link to={link} key={i} target="_blank" className='hover:text-black text-gray-500 hover:-translate-y-1 transition duration-300'>
                            {key !== "website" ? <FontAwesomeIcon icon={icon} /> : <FaGlobe />}
                        </Link>
                    ) : null;
                })}
            </div>
            <p className='text-lg leading-7 text-gray-500'>Joined on {getDate(joinedAt)}</p>
        </div>
    );
};

export default AboutUser;
