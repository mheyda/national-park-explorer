import ExploreTile from './ExploreTile.js';
import { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { useSelector } from 'react-redux';
import { selectFilter } from '../../features/parks/parksSlice.js';


export default function ExploreTiles( { parks, itemsPerPage } ) {

    const [currentItems, setCurrentItems] = useState(null);
    const [pageCount, setPageCount] = useState(0);
    // If an item offset and current page exists in storage, start with that
    const [itemOffset, setItemOffset] = useState(sessionStorage.getItem('exploreListCurrentOffset') ? parseInt(sessionStorage.getItem('exploreListCurrentOffset')) : 0);
    const [currentPage, setCurrentPage] = useState(sessionStorage.getItem('exploreListCurrentPage') ? parseInt(sessionStorage.getItem('exploreListCurrentPage')) : 0)

    useEffect(() => {
        if (parks && parks.length > 0) {
            // Fetch items from another resources.
            const endOffset = itemOffset + itemsPerPage;
            console.log(`Loading items from ${itemOffset} to ${endOffset}`);
            setCurrentItems(parks.slice(itemOffset, endOffset));
            setPageCount(Math.ceil(parks.length / itemsPerPage));
        }
    }, [itemOffset, itemsPerPage, parks]);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % parks.length;
        setCurrentPage(event.selected);
        setItemOffset(newOffset);

        // Push to sessionStorage so user will return to page they were on
        sessionStorage.setItem('exploreListCurrentPage', event.selected);
        sessionStorage.setItem('exploreListCurrentOffset', newOffset);
    }

    if (currentItems && currentItems.length > 0) {
        return (
            <>
                <ul className='explore-tiles'>
                    {currentItems.map((park, index) => {
                        return <ExploreTile key={index} park={park} />
                    })}
                </ul>
    
                <ReactPaginate
                    breakLabel="..."
                    nextLabel=">"
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={1}
                    marginPagesDisplayed={1}
                    pageCount={pageCount}
                    previousLabel="<"
                    renderOnZeroPageCount={null}
                    forcePage={currentPage}
                    containerClassName='page-nav-container'
                    pageClassName='page-nav-button'
                    activeClassName='page-nav-button-active'
                    disabledClassName='page-nav-button-disabled'
                    previousClassName='page-nav-previous'
                    nextClassName='page-nav-next'
                />
            </>
        );
    } else {
        return (
            <>Loading parks...</>
        );
    }

}
